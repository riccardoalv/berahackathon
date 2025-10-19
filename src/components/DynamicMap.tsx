"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L, {
  GeoJSON as LGeoJSON,
  LatLngExpression,
  Layer,
  PathOptions,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import { yellowToRed } from "@/app/page";

type Feature = GeoJSON.Feature<GeoJSON.Geometry, any>;
type FeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, any>;

/** ========= CONFIG ========= */
const BairrosLayerName = "geo:ba_bairros";
const LotesLayerName = "geo:lotes";

const bairrosStyle: PathOptions = {
  color: "#FFFFFF",
  weight: 1.6,
  opacity: 1,
  fillOpacity: 0.2,
};

/** ========= UTILS ========= */
function getBairroNome(props: any) {
  return (
    props?.nome ??
    props?.Nome ??
    props?.NOME ??
    props?.bairro ??
    props?.BAIRRO ??
    props?.name ??
    "Bairro"
  );
}

// GeoJSON -> WKT (Polygon/MultiPolygon)
function coordsToWktRing(ring: number[][]) {
  return ring.map(([lng, lat]) => `${lng} ${lat}`).join(", ");
}
function polygonToWkt(coords: number[][][]) {
  const rings = coords.map((ring) => `(${coordsToWktRing(ring)})`).join(", ");
  return `POLYGON(${rings})`;
}
function multiPolygonToWkt(coords: number[][][][]) {
  const polys = coords
    .map(
      (poly) =>
        `(${poly.map((ring) => `(${coordsToWktRing(ring)})`).join(", ")})`,
    )
    .join(", ");
  return `MULTIPOLYGON(${polys})`;
}
function geojsonToWkt(geom: GeoJSON.Geometry): string | null {
  if (geom.type === "Polygon")
    return polygonToWkt((geom as GeoJSON.Polygon).coordinates as any);
  if (geom.type === "MultiPolygon")
    return multiPolygonToWkt((geom as GeoJSON.MultiPolygon).coordinates as any);
  return null;
}

async function fetchWFS(params: Record<string, string>) {
  const url = new URL("/api/wfs", window.location.origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(
      `Falha WFS: ${resp.status} ${resp.statusText} — ${txt.slice(0, 200)}`,
    );
  }
  const data = (await resp.json()) as FeatureCollection;
  if (!data || data.type !== "FeatureCollection") {
    throw new Error("Resposta WFS inválida (esperado FeatureCollection).");
  }
  return data;
}

function FitOnData({ data }: { data: FeatureCollection | null }) {
  const map = useMap();
  useEffect(() => {
    if (!data || !data.features?.length) return;
    const layer = L.geoJSON(data);
    const bounds = layer.getBounds?.();
    if (bounds && bounds.isValid()) map.fitBounds(bounds.pad(0.05));
  }, [data, map]);
  return null;
}

/** ========= HEATMAP LAYER =========
 * Agora renderiza DOIS heat layers:
 * - zeros (valor === 0): verde (gradientZero)
 * - positivos (1..5): amarelo→vermelho (gradientNormal)
 */
function HeatmapLayer({
  points,
  radius = 42,
  blur = 26,
  maxZoom = 18,
  minOpacity = 0.35,
  gradient, // mantém compatibilidade (aplica ao layer "normal")
  zeroGradient, // novo: gradient específico para zeros
  zeroIntensity = 0.6, // novo: intensidade fixa para zeros (0..1)
}: {
  points: Array<[number, number, number]>; // [lng, lat, level]
  radius?: number;
  blur?: number;
  maxZoom?: number;
  minOpacity?: number;
  gradient?: Record<number, string>;
  zeroGradient?: Record<number, string>;
  zeroIntensity?: number;
}) {
  const map = useMap();
  const normalRef = useRef<any>(null);
  const zeroRef = useRef<any>(null);

  // defaults
  const gradientNormal: Record<number, string> = gradient ?? {
    // amarelo claro → vermelho escuro
    0.2: "#fff7bc",
    0.4: "#fec44f",
    0.6: "#fe9929",
    0.8: "#ec7014",
    1.0: "#cc4c02",
  };

  const gradientZeroDefault: Record<number, string> = zeroGradient ?? {
    // verde claro → verde escuro
    0.2: "#c7f9cc",
    0.5: "#80ed99",
    0.8: "#38a169",
    1.0: "#1f7a4d",
  };

  useEffect(() => {
    let disposed = false;
    (async () => {
      await import("leaflet.heat");

      // separa pontos em zeros e positivos
      const zeros = points.filter((p) => p[2] === 0);
      const positives = points.filter((p) => p[2] > 0);

      // transforma para [lat, lng, intensity]
      const zeroLatLngs = zeros.map(([lng, lat]) => [lat, lng, zeroIntensity]);
      const normalLatLngs = positives.map(([lng, lat, level]) => {
        // mapeia 1..5 para 0.2..1 (mantendo visível à distância)
        const norm = Math.max(1, Math.min(level, 5)) / 5; // 0.2–1
        return [lat, lng, norm] as [number, number, number];
      });

      // limpa layers anteriores
      if (normalRef.current) {
        map.removeLayer(normalRef.current);
        normalRef.current = null;
      }
      if (zeroRef.current) {
        map.removeLayer(zeroRef.current);
        zeroRef.current = null;
      }

      // cria layer VERDE (zeros)
      if (zeroLatLngs.length) {
        const zeroHeat = (L as any).heatLayer(zeroLatLngs, {
          radius,
          blur,
          maxZoom,
          minOpacity,
          gradient: gradientZeroDefault,
        });
        if (!disposed) {
          zeroHeat.addTo(map);
          zeroRef.current = zeroHeat;
        } else {
          map.removeLayer(zeroHeat);
        }
      }

      // cria layer NORMAL (amarelo→vermelho)
      if (normalLatLngs.length) {
        const normalHeat = (L as any).heatLayer(normalLatLngs, {
          radius,
          blur,
          maxZoom,
          minOpacity,
          gradient: gradientNormal,
        });
        if (!disposed) {
          normalHeat.addTo(map);
          normalRef.current = normalHeat;
        } else {
          map.removeLayer(normalHeat);
        }
      }
    })();

    return () => {
      disposed = true;
      if (normalRef.current) {
        map.removeLayer(normalRef.current);
        normalRef.current = null;
      }
      if (zeroRef.current) {
        map.removeLayer(zeroRef.current);
        zeroRef.current = null;
      }
    };
  }, [
    map,
    radius,
    blur,
    maxZoom,
    minOpacity,
    JSON.stringify(points), // re-render quando mudar pontos
    JSON.stringify(gradient), // e gradients
    JSON.stringify(zeroGradient),
    zeroIntensity,
  ]);

  return null;
}

/** Pequeno controle para limpar lotes */
function ClearControl({
  onClear,
  loading,
}: {
  onClear: () => void;
  loading: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    const ctl = L.control({ position: "topright" });
    ctl.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar");
      const btn = L.DomUtil.create("a", "", div);
      btn.href = "#";
      btn.title = loading ? "Carregando lotes..." : "Limpar lotes";
      btn.innerHTML = loading ? "⏳" : "×";
      btn.style.width = "28px";
      btn.style.height = "28px";
      btn.style.lineHeight = "28px";
      btn.style.textAlign = "center";
      btn.style.fontWeight = "bold";
      btn.onclick = (e) => {
        e.preventDefault();
        onClear();
      };
      return div;
    };
    ctl.addTo(map);
    return () => ctl.remove();
  }, [map, onClear, loading]);
  return null;
}

/** Alterna mostrar/ocultar labels de bairros */
function LabelsToggleControl({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.getContainer().classList.toggle("hide-bairro-label", !show);
  }, [map, show]);

  useEffect(() => {
    const ctl = L.control({ position: "topright" });
    ctl.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar");
      const btn = L.DomUtil.create("a", "", div);
      btn.href = "#";
      btn.title = show
        ? "Ocultar nomes dos bairros"
        : "Mostrar nomes dos bairros";
      btn.innerHTML = show ? "🛈" : "🚫";
      btn.style.width = "28px";
      btn.style.height = "28px";
      btn.style.lineHeight = "28px";
      btn.style.textAlign = "center";
      btn.style.fontWeight = "bold";
      btn.onclick = (e) => {
        e.preventDefault();
        setShow(!show);
      };
      return div;
    };
    ctl.addTo(map);
    return () => ctl.remove();
  }, [map, show, setShow]);

  return null;
}

/** ========= MAPA DINÂMICO ========= */
export const ZERO_COLOR = "#1f7a4d"; // verde para zero

function intensityToColor(value: number): string {
  if (value <= 0) return ZERO_COLOR;
  // Normaliza 1..5 -> 0..1
  const t = Math.max(0, Math.min(1, (value - 1) / 4));
  // Pega a “chave” do gradiente mais próxima acima de t
  const keys = Object.keys(yellowToRed)
    .map(parseFloat)
    .sort((a, b) => a - b);
  for (const k of keys) {
    if (t <= k) return yellowToRed[k];
  }
  return yellowToRed[1.0];
}

// Tenta achar um id de forma resiliente
function getFeatureId(f: Feature): string {
  return (
    (f.id as string) ??
    f.properties?.id ??
    f.properties?.gid ??
    f.properties?.objectid ??
    JSON.stringify(f.properties)
  );
}

// Constrói um dicionário lotId -> intensidade (usa o maior valor que caiu dentro do lote)
function buildLotIntensityMap(
  lotes: FeatureCollection | null,
  points: Array<[number, number, number]>, // [lng, lat, value]
) {
  const result = new Map<string, number>();
  if (!lotes || !points?.length) return result;

  // Pré-cria pontos turf
  const turfPoints = points.map(([lng, lat, v]) => ({
    pt: turf.point([lng, lat]),
    val: v ?? 0,
  }));

  for (const f of lotes.features) {
    if (!f?.geometry) continue;

    const lotId = getFeatureId(f);
    const geom = f.geometry as turf.helpers.Polygon | turf.helpers.MultiPolygon;

    // Bounding box rápido para descartar pontos longe
    const bbox = turf.bbox(geom);
    const bboxPoly = turf.bboxPolygon(bbox);

    let best = result.get(lotId) ?? -Infinity;

    for (const { pt, val } of turfPoints) {
      // primeiro checa bbox (barato), depois polígono (caro)
      if (!turf.booleanPointInPolygon(pt, bboxPoly)) continue;
      if (turf.booleanPointInPolygon(pt, geom)) {
        // Regra: mantemos o MAIOR valor que caiu dentro deste lote
        if (val > best) best = val;
      }
    }

    if (best !== -Infinity) {
      result.set(lotId, best);
    }
  }
  return result;
}

const lotesBaseStyle: PathOptions = {
  color: "#111",
  weight: 0.8,
  opacity: 1,
  fillColor: "#cccccc",
  fillOpacity: 0.5,
};

export default function DynamicMap({
  center = [-8.7619, -63.9039] as LatLngExpression,
  zoom = 12,
  className,
  heatData = [],
  heatOptions,
}: {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  heatData?: Array<[number, number, number]>; // [lng, lat, value(0..5)]
  heatOptions?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    minOpacity?: number;
    gradient?: Record<number, string>;
    zeroGradient?: Record<number, string>;
    zeroIntensity?: number;
  };
}) {
  const [bairros, setBairros] = useState<FeatureCollection | null>(null);
  const [lotes, setLotes] = useState<FeatureCollection | null>(null);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const [showBairroLabels, setShowBairroLabels] = useState(true);

  const bairrosLayerRef = useRef<LGeoJSON>(null);
  const lotesLayerRef = useRef<LGeoJSON>(null);

  // Carrega bairros ao montar
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWFS({
          typeName: BairrosLayerName,
          srsName: "EPSG:4326",
          version: "1.0.0",
          maxFeatures: "5000",
        });
        setBairros(data);
      } catch (e) {
        console.error(e);
        setBairros(null);
      }
    })();
  }, []);

  // Clique em um bairro => zoom + busca lotes por INTERSECTS
  const onEachBairro = useCallback((feature: Feature, layer: Layer) => {
    const nome =
      getBairroNome?.(feature.properties) ?? feature.properties?.nome ?? "";
    (layer as any).bindTooltip(String(nome), {
      permanent: true,
      direction: "center",
      className: "bairro-label",
    });

    layer.on("click", async () => {
      try {
        const bounds = (layer as any).getBounds?.();
        const map = (layer as any)._map as L.Map | undefined;
        if (map && bounds && bounds.isValid()) map.fitBounds(bounds.pad(0.05));

        const wkt = geojsonToWkt(feature.geometry);
        if (!wkt) {
          console.warn("Geometria não suportada para filtro.");
          setLotes(null);
          return;
        }

        setLoadingLotes(true);
        const cql = `INTERSECTS(geom, ${wkt})`;
        const data = await fetchWFS({
          typeName: LotesLayerName,
          srsName: "EPSG:4326",
          version: "1.0.0",
          maxFeatures: "20000",
          CQL_FILTER: cql,
        });
        setLotes(data);
      } catch (e) {
        console.error(e);
        setLotes(null);
      } finally {
        setLoadingLotes(false);
      }
    });
  }, []);

  // 🔍 Calcula quais lotes devem ser pintados e com que intensidade
  const lotIntensityById = useMemo(
    () => buildLotIntensityMap(lotes, heatData),
    [lotes, heatData],
  );

  // 🎨 Função de estilo dinâmica para LOTES com base no mapa acima
  const lotesStyleFn = useCallback(
    (feat: Feature) => {
      const id = getFeatureId(feat);
      const intensity = lotIntensityById.get(id);

      if (intensity !== undefined) {
        const fill = intensityToColor(intensity);
        return {
          ...lotesBaseStyle,
          fillColor: fill,
          fillOpacity: 0.65,
          color: "#222",
          weight: 0.8,
        } as PathOptions;
      }
      // Sem match: mantém estilo bem leve
      return { ...lotesBaseStyle } as PathOptions;
    },
    [lotIntensityById],
  );

  const bairrosStyleFn = useCallback(() => bairrosStyle, []);

  return (
    <>
      <style jsx global>{`
        .bairro-label {
          font:
            700 10px/1.1 Inter,
            system-ui,
            -apple-system,
            Segoe UI,
            Roboto,
            Arial,
            sans-serif;
          color: #111;
          text-shadow:
            0 0 3px rgba(255, 255, 255, 0.9),
            0 0 6px rgba(255, 255, 255, 0.8);
          padding: 2px 4px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
        }
        .hide-bairro-label .bairro-label {
          display: none !important;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        zoomControl={false}
        className={className ?? "h-[85vh] w-full"}
        style={
          !className ? { height: "85vh", width: "80%", zIndex: 0 } : undefined
        }
        maxZoom={19}
      >
        <ZoomControl position="topright" />
        <ClearControl onClear={() => setLotes(null)} loading={loadingLotes} />
        <LabelsToggleControl
          show={showBairroLabels}
          setShow={setShowBairroLabels}
        />

        {/* 🌎 Satélite (sem labels) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        />

        {/* 🔥 Heatmap opcional (mantive seu componente) */}
        {heatData?.length ? (
          <HeatmapLayer points={heatData} {...(heatOptions ?? {})} />
        ) : null}

        {/* 🗺️ Bairros */}
        {bairros && (
          <>
            <GeoJSON
              ref={bairrosLayerRef as any}
              data={bairros as any}
              style={bairrosStyleFn}
              onEachFeature={onEachBairro}
            />
            <FitOnData data={bairros} />
          </>
        )}

        {/* ▢ Lotes (pintados conforme heatData) */}
        {lotes && (
          <GeoJSON
            ref={lotesLayerRef as any}
            data={lotes as any}
            style={lotesStyleFn}
          />
        )}
      </MapContainer>
    </>
  );
}

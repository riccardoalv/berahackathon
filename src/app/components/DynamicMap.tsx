"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  GeoJSON,
  LayersControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type WmsOverlay = {
  name: string;
  url: string;
  params: {
    layers: string;
    format?: string;
    transparent?: boolean;
    version?: "1.1.1" | "1.3.0";
    styles?: string;
  };
};

interface Props {
  center: [number, number] | { lat: number; lng: number } | any;
  zoom?: number;
  geoJsonData?: any | null;
  wmsOverlays?: WmsOverlay[];
}

function FitGeoJSON({ data }: { data: any }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;
    try {
      const L = require("leaflet");
      const layer = L.geoJSON(data);
      const bounds = layer.getBounds?.();
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds.pad(0.08));
      }
    } catch (e) {
      console.warn("Não foi possível ajustar o mapa ao GeoJSON:", e);
    }
  }, [data, map]);

  return null;
}

export default function DynamicMap({
  center,
  zoom = 13,
  geoJsonData,
  wmsOverlays = [],
}: Props) {
  const memoGeoJSON = useMemo(() => geoJsonData, [geoJsonData]);
  const { BaseLayer, Overlay } = LayersControl;

  return (
    <MapContainer
      center={Array.isArray(center) ? center : [center.lat, center.lng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <LayersControl position="topright">
        {/* BASES ========================================== */}
        <BaseLayer checked name="Mapa Padrão (OpenStreetMap)">
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          />
        </BaseLayer>

        <BaseLayer name="Satélite (Esri)">
          <TileLayer
            attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </BaseLayer>

        {/* OVERLAYS ====================================== */}
        {wmsOverlays.map((ov) => (
          <Overlay checked key={ov.name} name={ov.name}>
            <WMSTileLayer
              url={ov.url}
              layers={ov.params.layers}
              format={ov.params.format ?? "image/png"}
              transparent={ov.params.transparent ?? true}
              version={ov.params.version ?? "1.1.1"}
              styles={ov.params.styles ?? ""}
              opacity={0.8}
            />
          </Overlay>
        ))}

        {memoGeoJSON && (
          <Overlay checked name="Camada GeoJSON (WFS)">
            <GeoJSON data={memoGeoJSON} />
          </Overlay>
        )}
      </LayersControl>

      {memoGeoJSON && <FitGeoJSON data={memoGeoJSON} />}
    </MapContainer>
  );
}

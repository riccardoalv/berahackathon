"use client";

import { useState } from "react";
import type { LatLngExpression } from "leaflet";
import MapLoader from "../../../components/DynamicMap";

const WMS_ENDPOINT = "https://geoserver.portovelho.ro.gov.br/geoserver/geo/wms";

const layers = [
  { name: "Selecione uma camada", value: "" },
  { name: "Bairros", value: "geo:ba_bairros" },
  { name: "Limite do Município", value: "geo:ba_limite_municipio" },
  { name: "Lotes (WFS)", value: "geo:lotes" },
  {
    name: "Escolas Municipais Urbanas",
    value: "geo:um_escolas_municipais_urbanas",
  },
  { name: "Unidades de Saúde", value: "geo:um_unidades_municipais_saude" },
  { name: "Logradouros (Ruas)", value: "geo:mo_porto_velho_logradouros" },
];

export default function HomePage() {
  const [selectedLayer, setSelectedLayer] = useState<string>("");
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showLotesWms, setShowLotesWms] = useState<boolean>(true);

  const center: LatLngExpression = [-8.7619, -63.9039]; // Porto Velho

  const handleLayerChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const layerName = event.target.value;
    setSelectedLayer(layerName);

    if (!layerName) {
      setGeoJsonData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL("/api/wfs", window.location.origin);
      url.searchParams.set("typeName", layerName);
      url.searchParams.set("srsName", "EPSG:4326");
      url.searchParams.set("version", "1.1.0");
      url.searchParams.set("maxFeatures", "2000");

      const response = await fetch(url.toString());
      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        const problem = await safeJson(response);
        throw new Error(
          problem?.error
            ? `${problem.error} — ${problem.details ?? ""}`.trim()
            : `Falha na requisição: ${response.status} ${response.statusText}`,
        );
      }

      if (!contentType.includes("json")) {
        const text = await response.text();
        throw new Error(
          "O servidor não retornou JSON (possível GML/XML). Tente reduzir maxFeatures ou usar bbox.\n" +
            text.slice(0, 300),
        );
      }

      const data = await response.json();
      if (!data || (data.type !== "FeatureCollection" && !data.features)) {
        throw new Error(
          "Resposta inesperada: não é um FeatureCollection válido.",
        );
      }
      setGeoJsonData(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Erro desconhecido";
      console.error(err);
      setError(
        `Não foi possível carregar a camada. O serviço pode estar offline, o nome pode estar incorreto, ou a camada é muito grande. Detalhes: ${msg}`,
      );
      setGeoJsonData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // configuração do overlay WMS (ligada ao checkbox)
  const wmsOverlays = showLotesWms
    ? [
        {
          name: "Lotes (WMS)",
          url: WMS_ENDPOINT,
          params: {
            layers: "geo:lotes",
            format: "image/png",
            transparent: true,
            version: "1.1.1", // WMS 1.1.1 (srs) – compatível com EPSG:4326
          } as const,
        },
      ]
    : [];

  return (
    <main className="min-h-screen w-full bg-gray-50">
      <header className="w-full bg-gray-800 px-4 py-3 text-white shadow">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl font-bold">
            GeoPortal de Porto Velho (Next.js)
          </h1>
          <p className="text-sm opacity-80">
            Visualizador de dados do WFS + sobreposição WMS
          </p>
        </div>
      </header>

      {/* Conteúdo centralizado e mapa reduzido */}
      <div className="mx-auto mt-4 grid max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-12">
        <aside className="sm:col-span-4">
          <div className="rounded-xl bg-white p-4 shadow">
            <label
              htmlFor="layer-select"
              className="block text-sm font-medium text-gray-700"
            >
              Escolha a camada (WFS/GeoJSON):
            </label>
            <select
              id="layer-select"
              value={selectedLayer}
              onChange={handleLayerChange}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              {layers.map((layer) => (
                <option key={layer.value} value={layer.value}>
                  {layer.name}
                </option>
              ))}
            </select>

            <div className="mt-4 flex items-center gap-2">
              <input
                id="toggle-wms"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={showLotesWms}
                onChange={(e) => setShowLotesWms(e.target.checked)}
              />
              <label htmlFor="toggle-wms" className="text-sm text-gray-700">
                Sobrepor <strong>Lotes (WMS)</strong> como imagem
              </label>
            </div>

            {isLoading && (
              <p className="mt-2 text-sm text-gray-500">Carregando dados...</p>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {selectedLayer && !isLoading && !error && (
              <p className="mt-3 text-xs text-gray-500">
                Dica: camadas como <strong>Lotes</strong> e{" "}
                <strong>Logradouros</strong> podem ser grandes. Considere
                filtrar por área (bbox) no futuro.
              </p>
            )}
          </div>
        </aside>

        <section className="sm:col-span-8">
          {/* Altura reduzida e container centralizado */}
          <div className="h-[65vh] w-full overflow-hidden rounded-xl bg-white shadow">
            <MapLoader
              center={center}
              zoom={13}
              geoJsonData={geoJsonData}
              wmsOverlays={wmsOverlays}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

async function safeJson(resp: Response) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

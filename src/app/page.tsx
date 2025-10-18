"use client";

import { useState } from "react";
import type { LatLngExpression } from "leaflet";
import MapLoader from "./components/DynamicMap";

const layers = [
  { name: "Selecione uma camada", value: "" },
  { name: "Bairros", value: "geo:ba_bairros" },
  { name: "Limite do Município", value: "geo:ba_limite_municipio" },
  { name: "Lotes", value: "geo:lotes" },
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
      // Dica: você pode passar bbox do mapa aqui no futuro (via estado do MapLoader)
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
      // sanity check básico
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

  return (
    <main className="flex h-screen w-screen flex-col items-center">
      <header className="z-10 w-full bg-gray-800 p-4 text-white shadow-md">
        <h1 className="text-2xl font-bold">
          GeoPortal de Porto Velho (Next.js)
        </h1>
        <p>Visualizador de dados do WFS municipal</p>
      </header>

      <div className="relative w-full flex-grow">
        <div className="absolute left-4 top-4 z-[1000] rounded-md bg-white p-3 shadow-lg">
          <label
            htmlFor="layer-select"
            className="block text-sm font-medium text-gray-700"
          >
            Escolha a camada:
          </label>
          <select
            id="layer-select"
            value={selectedLayer}
            onChange={handleLayerChange}
            disabled={isLoading}
            className="mt-1 block w-72 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {layers.map((layer) => (
              <option key={layer.value} value={layer.value}>
                {layer.name}
              </option>
            ))}
          </select>

          {isLoading && (
            <p className="mt-2 text-sm text-gray-500">Carregando dados...</p>
          )}
          {error && (
            <p className="mt-2 max-w-96 text-sm text-red-600">{error}</p>
          )}

          {selectedLayer && !isLoading && !error && (
            <p className="mt-2 text-xs text-gray-500">
              Dica: camadas como <strong>Lotes</strong> e{" "}
              <strong>Logradouros</strong> podem ser grandes. Considere filtrar
              por área (bbox) no futuro.
            </p>
          )}
        </div>

        <MapLoader center={center} zoom={13} geoJsonData={geoJsonData} />
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

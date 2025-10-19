// app/api/wfs/route.ts
import { NextRequest } from "next/server";

const GEOSERVER_WFS =
  "https://geoserver.portovelho.ro.gov.br/geoserver/geo/ows";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const typeName = searchParams.get("typeName");
  const version = searchParams.get("version") || "1.0.0";
  const srsName = searchParams.get("srsName") || "EPSG:4326";
  const outputFormat = searchParams.get("outputFormat") || "application/json";
  const cql_filter = searchParams.get("CQL_FILTER"); // passthrough opcional
  const maxFeatures = searchParams.get("maxFeatures") || "2000"; // limitação segura

  if (!typeName) {
    return Response.json(
      { error: "Parâmetro obrigatório: typeName" },
      { status: 400 },
    );
  }

  const url = new URL(GEOSERVER_WFS);
  url.searchParams.set("service", "WFS");
  url.searchParams.set("version", version);
  url.searchParams.set("request", "GetFeature");
  url.searchParams.set("typeName", typeName);
  url.searchParams.set("outputFormat", outputFormat);
  url.searchParams.set("srsName", srsName);
  url.searchParams.set("maxFeatures", maxFeatures);
  if (cql_filter) url.searchParams.set("CQL_FILTER", cql_filter);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!response.ok) {
      return Response.json(
        {
          error: `Erro ${response.status}: ${response.statusText}`,
          details: text.slice(0, 500),
        },
        { status: response.status },
      );
    }

    if (!contentType.includes("json")) {
      return Response.json(
        {
          error: "GeoServer retornou formato não JSON (possível GML/XML).",
          exemplo: text.slice(0, 400),
        },
        { status: 502 },
      );
    }

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return Response.json(
      {
        error: "Falha ao consultar GeoServer",
        details: String(error?.message || error),
      },
      { status: 500 },
    );
  }
}

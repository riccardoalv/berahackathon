// app/api/wfs/route.ts
import { NextRequest } from "next/server";

const GEOSERVER_WFS = "https://geoserver.portovelho.ro.gov.br/geoserver/ows";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeName = searchParams.get("typeName");
  const srsName = searchParams.get("srsName") || "EPSG:4326";
  const maxFeatures = searchParams.get("maxFeatures") || "2000"; // segura a mão nas camadas grandes
  const version = searchParams.get("version") || "1.1.0";
  const bbox = searchParams.get("bbox"); // opcional (melhor ainda se você enviar a bbox do mapa)

  if (!typeName) {
    return new Response(
      JSON.stringify({ error: "Parâmetro obrigatório: typeName" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const url = new URL(GEOSERVER_WFS);
  url.searchParams.set("service", "WFS");
  url.searchParams.set("request", "GetFeature");
  url.searchParams.set("version", version); // 1.1.0 usa typeName; 2.0.0 usaria typeNames
  url.searchParams.set("typeName", typeName);
  url.searchParams.set("srsName", srsName);
  // GeoServer aceita ambos; este costuma vir com Content-Type correto:
  url.searchParams.set("outputFormat", "application/json");
  url.searchParams.set("maxFeatures", maxFeatures);
  if (bbox) url.searchParams.set("bbox", bbox);

  try {
    const georesp = await fetch(url.toString(), {
      // Importante: API Route roda no server, evita CORS do browser
      // Você pode ajustar timeout com AbortController se quiser.
      headers: {
        // evita content-negotiation errada
        Accept: "application/json, application/vnd.geo+json;q=0.9, */*;q=0.8",
      },
      // cache curto para aliviar o servidor sem “congelar” dados
      // @ts-expect-error - Next allows this option
      next: { revalidate: 30 },
    });

    const contentType = georesp.headers.get("content-type") || "";
    const text = await georesp.text();

    // Se o servidor devolver XML (GML) por qualquer motivo, avisa claramente
    if (!georesp.ok) {
      return new Response(
        JSON.stringify({
          error: `GeoServer respondeu ${georesp.status} ${georesp.statusText}`,
          details: text.slice(0, 500),
        }),
        {
          status: georesp.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!contentType.includes("json")) {
      // geralmente GML vem como XML quando o layer é enorme ou format não bate
      return new Response(
        JSON.stringify({
          error: "Resposta não-JSON do GeoServer (possível GML/XML).",
          hint: "Tente reduzir maxFeatures ou usar bbox no request. Também confira o nome exato da camada e o namespace.",
          sample: text.slice(0, 500),
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // habilita CORS pra seu front (ajuste se quiser restringir)
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        error: "Falha ao consultar o GeoServer.",
        message: String(e?.message || e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

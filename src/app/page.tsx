"use client";

import { useMemo } from "react";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./components/DynamicMap"), {
  ssr: false,
  loading: () => <p>Carregando mapa...</p>,
});

export const yellowToRed = {
  0.2: "#fff7b3",
  0.4: "#ffe27a",
  0.6: "#ffb347",
  0.8: "#ff6f3c",
  1.0: "#b30000",
};

export default function HomePage() {
  // Centro de Porto Velho — [lat, lng]
  const center: [number, number] = [-8.76194, -63.90389];

  // Pontos do heatmap — [lng, lat, nível 1..5]
  const heatData = useMemo<Array<[number, number, number]>>(
    () => [
      [-63.9039, -8.7619, 5],
      [-63.9055, -8.7612, 4],
      [-63.9017, -8.7631, 3],
      [-63.9078, -8.7642, 2],
      [-63.8989, -8.7608, 1],
      [-63.92, -8.7625, 4],
      [-63.885, -8.7625, 3],
      [-63.90389, -8.7455, 2],
      [-63.90389, -8.7805, 4],
      [-63.915, -8.755, 3],
      [-63.892, -8.77, 5],
      [-63.91, -8.772, 2],
      [-63.895, -8.752, 4],
    ],
    [],
  );

  return (
    <main className="min-h-screen w-full bg-gray-50">
      <header className="w-full bg-gray-900 text-white px-4 py-3">
        <h1 className="text-lg font-semibold">
          Mapa — Heatmap (amarelo → vermelho) + Bairros/Lotes
        </h1>
        <p className="text-xs opacity-80">
          Clique em um bairro para dar zoom e carregar os lotes dele.
        </p>
      </header>

      <section className="px-2 py-3">
        <div className="rounded-xl overflow-hidden shadow bg-white">
          <DynamicMap
            center={center} // 👈 [lat, lng]
            zoom={12}
            heatData={heatData} // 👈 [lng, lat, nível]
            heatOptions={{
              radius: 30,
              blur: 0,
              minOpacity: 0.9,
              gradient: yellowToRed,
            }}
          />
        </div>
      </section>
    </main>
  );
}

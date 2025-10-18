import dynamic from "next/dynamic";
import { useMemo } from "react";

// Importa o componente de mapa de forma dinâmica, desativando a renderização no servidor (SSR)
const DynamicMap = dynamic(() => import("./Map"), {
  ssr: false,
});

// Envolve o componente dinâmico para facilitar o uso
const MapLoader = (props: any) => {
  const MapComponent = useMemo(
    () =>
      dynamic(() => import("./Map"), {
        ssr: false,
      }),
    [],
  );

  return <MapComponent {...props} />;
};

export default MapLoader;

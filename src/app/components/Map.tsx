"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";
import { FC } from "react";

interface MapProps {
  center: LatLngExpression;
  zoom: number;
  geoJsonData: any;
}

const Map: FC<MapProps> = ({ center, zoom, geoJsonData }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      {/* Camada de base do mapa (OpenStreetMap é gratuito) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Camada para exibir os dados do WFS */}
      {geoJsonData && <GeoJSON data={geoJsonData} />}
    </MapContainer>
  );
};

export default Map;

"use client";

import dynamic from "next/dynamic";
import { useEffect, type ComponentType } from "react";
import type { MapContainerProps, TileLayerProps, MarkerProps, PopupProps } from "react-leaflet";

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false }) as unknown as ComponentType<MapContainerProps>;
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false }) as unknown as ComponentType<TileLayerProps>;
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, { ssr: false }) as unknown as ComponentType<MarkerProps>;
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false }) as unknown as ComponentType<PopupProps>;

type Item = { tokenId: number; name?: string; latitude?: number; longitude?: number };

export default function DiscoverMap({ items }: { items: Item[] }) {
  useEffect(() => {
    // import Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="rounded-lg border overflow-hidden z-0">
      {/* @ts-expect-error react-leaflet dynamic import prop types can be incomplete under Next.js */}
      <MapContainer center={[20, 0]} zoom={2} style={{ height: 400, width: "100%" }}>
        {/* @ts-expect-error react-leaflet type gap for attribution prop under dynamic import */}
        <TileLayer url="https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap contributors &copy; CARTO" />
        {items.filter((i) => typeof i.latitude === "number" && typeof i.longitude === "number").map((i) => (
          <Marker key={i.tokenId} position={[i.latitude as number, i.longitude as number]}>
            <Popup>
              <a href={`/cat/${i.tokenId}`} className="underline">{i.name || `Cat #${i.tokenId}`}</a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}



"use client";

import React, { useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  CircleMarker,
} from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { heatmapPoints } from "@/lib/dummy-data";

// Custom marker icon using SVG or red icon
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function CustomerMapClient() {
  const center: [number, number] = useMemo(() => [-8.1332, 113.2245], []);

  return (
    <Card className="rounded-2xl border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-[#171717]">
              Peta Lokasi Pelanggan & Jaringan
            </CardTitle>
            <Badge variant="destructive" className="bg-[#d51100] text-[10px] px-2 py-0.5">
              Live Area
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[#5c5c5c]">
            Distribusi titik pelanggan terpasang di wilayah Kab. Lumajang dan sekitarnya
          </p>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-[#5c5c5c] sm:mt-0">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d51100]" /> Titik Pelanggan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#171717]" /> Area Cakupan
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="h-[420px] w-full overflow-hidden rounded-xl border border-[#e5e5e5]">
          <MapContainer
            center={center}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {heatmapPoints.map((point) => (
              <React.Fragment key={point.id}>
                {/* Coverage Circle */}
                <CircleMarker
                  center={[point.lat, point.lng]}
                  radius={point.intensity * 25}
                  pathOptions={{
                    color: "#d51100",
                    fillColor: "#d51100",
                    fillOpacity: 0.12,
                    weight: 1,
                  }}
                />

                {/* Marker */}
                <Marker position={[point.lat, point.lng]} icon={redIcon}>
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <p className="font-bold text-sm text-[#171717]">{point.name}</p>
                      <p className="text-xs text-[#5c5c5c] mt-0.5">{point.category}</p>
                      <div className="mt-2 pt-2 border-t border-neutral-100 flex flex-col gap-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#5c5c5c]">Pengguna Aktif:</span>
                          <span className="font-semibold text-[#171717]">{point.activeUsers} user</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5c5c5c]">Bandwidth:</span>
                          <span className="font-semibold text-[#d51100]">{point.bandwidthUsage}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

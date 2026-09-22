"use client";

import React, { useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
} from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { heatmapPoints, wilayahData } from "@/lib/dummy-data";
import { Flame, Layers, Radio } from "lucide-react";

// Red custom pin icon
const pinIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function HeatmapPreviewClient() {
  const center: [number, number] = useMemo(() => [-8.1332, 113.2245], []);

  return (
    <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d51100]/10 text-[#d51100]">
              <Flame className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold text-[#171717]">
              Heatmap Aktivitas Jaringan & Pelanggan
            </CardTitle>
            <Badge variant="outline" className="border-[#e5e5e5] text-[11px] text-[#5c5c5c]">
              Kabupaten Lumajang
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[#5c5c5c]">
            Visualisasi kepadatan penetrasi internet dan transmisi data di zona aktif
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:mt-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1 text-[#171717]">
            <Radio className="h-3.5 w-3.5 text-[#d51100] animate-pulse" />
            <span className="font-medium">8 Node Aktif</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-1 text-[#5c5c5c]">
            <Layers className="h-3.5 w-3.5" />
            <span>Layer Kerapatan</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="relative h-[440px] w-full overflow-hidden rounded-xl border border-[#e5e5e5]">
          <MapContainer
            center={center}
            zoom={12}
            scrollWheelZoom={false}
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Heatmap simulation circles with varying gradients and radii */}
            {heatmapPoints.map((pt) => {
              const radius = pt.intensity * 900;
              return (
                <React.Fragment key={`heat-${pt.id}`}>
                  {/* Outer glow */}
                  <Circle
                    center={[pt.lat, pt.lng]}
                    radius={radius * 1.5}
                    pathOptions={{
                      color: "#d51100",
                      fillColor: "#d51100",
                      fillOpacity: 0.08,
                      weight: 0,
                    }}
                  />
                  {/* Mid intensity */}
                  <Circle
                    center={[pt.lat, pt.lng]}
                    radius={radius}
                    pathOptions={{
                      color: "#d51100",
                      fillColor: "#d51100",
                      fillOpacity: 0.22,
                      weight: 1,
                    }}
                  />
                  {/* Core hotspot */}
                  <Circle
                    center={[pt.lat, pt.lng]}
                    radius={radius * 0.4}
                    pathOptions={{
                      color: "#d51100",
                      fillColor: "#d51100",
                      fillOpacity: 0.45,
                      weight: 2,
                    }}
                  />
                  {/* Marker Pin with Popup */}
                  <Marker position={[pt.lat, pt.lng]} icon={pinIcon}>
                    <Popup>
                      <div className="p-1 min-w-[190px]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-xs text-[#171717]">{pt.name}</p>
                          <span className="rounded bg-[#d51100] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {(pt.intensity * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5c5c5c] mt-0.5">{pt.category}</p>
                        <div className="mt-2 space-y-1 border-t border-neutral-100 pt-1.5 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-[#5c5c5c]">Trafik Terpasang:</span>
                            <span className="font-semibold text-[#171717]">{pt.activeUsers} unit</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5c5c5c]">Throughput:</span>
                            <span className="font-semibold text-[#d51100]">{pt.bandwidthUsage}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}

            {/* Wilayah Markers */}
            {wilayahData.slice(0, 4).map((wil) => (
              <Circle
                key={`wil-${wil.id}`}
                center={[wil.lat, wil.lng]}
                radius={300}
                pathOptions={{
                  color: "#171717",
                  fillColor: "#171717",
                  fillOpacity: 0.15,
                  weight: 1,
                  dashArray: "4 4",
                }}
              />
            ))}
          </MapContainer>

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-[1000] rounded-xl border border-[#e5e5e5] bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
            <p className="font-semibold text-[#171717] mb-1.5 text-[11px]">Intensitas Penetrasi</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[#5c5c5c]/30 via-[#d51100]/50 to-[#d51100]" />
              <span className="text-[10px] text-[#5c5c5c]">Rendah → Padat</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

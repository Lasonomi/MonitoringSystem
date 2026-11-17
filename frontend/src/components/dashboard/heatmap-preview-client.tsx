"use client";

import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { latLngBounds } from "leaflet";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Layers, MapPin } from "lucide-react";

export interface HeatmapRegion {
  id: string;
  name: string;
  source: "Kota" | "DATEL";
  count: number;
}

type MappedHeatmapRegion = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
  sourceRegions: HeatmapRegion[];
};

type CityLocation = {
  label: string;
  coordinates: [number, number];
};

const cityLocations: Record<string, CityLocation> = {
  "lumajang kota": { label: "Lumajang", coordinates: [-8.1332, 113.2245] },
  lumajang: { label: "Lumajang", coordinates: [-8.1332, 113.2245] },
  "balai selasa sumbar": { label: "Balai Selasa, Sumbar", coordinates: [-1.795466, 100.836668] },
  bondowoso: { label: "Bondowoso", coordinates: [-7.9135, 113.8215] },
  jember: { label: "Jember", coordinates: [-8.1845, 113.6681] },
  jatiroto: { label: "Jatiroto", coordinates: [-8.1223326, 113.3638797] },
  sukodono: { label: "Sukodono", coordinates: [-8.1065, 113.2381] },
  klakah: { label: "Klakah", coordinates: [-7.9892, 113.2575] },
  pasirian: { label: "Pasirian", coordinates: [-8.2163, 113.1092] },
  situbondo: { label: "Situbondo", coordinates: [-7.706, 114.009] },
  sibo: { label: "Situbondo", coordinates: [-7.706, 114.009] },
  tempeh: { label: "Tempeh", coordinates: [-8.1925, 113.1812] },
  senduro: { label: "Senduro", coordinates: [-8.1008, 113.1118] },
  yosowilangun: { label: "Yosowilangun", coordinates: [-8.2435, 113.2872] },
  rowokangkung: { label: "Rowokangkung", coordinates: [-8.1751, 113.2819] },
};

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase("id-ID");
}

function FitMapToRegions({ regions }: { regions: MappedHeatmapRegion[] }) {
  const map = useMap();

  useEffect(() => {
    if (regions.length === 0) return;

    const frame = requestAnimationFrame(() => {
      if (!map.getContainer().isConnected) return;

      const bounds = latLngBounds(
        regions.map((region) => [region.lat, region.lng] as [number, number]),
      );
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
    });

    return () => cancelAnimationFrame(frame);
  }, [map, regions]);

  return null;
}

export function HeatmapPreviewClient({ regions }: { regions: HeatmapRegion[] }) {
  const { mappedRegions, unmappedRegions, unmappedOrders, maxOrders } = useMemo(() => {
    const mappedByLocation = new Map<string, MappedHeatmapRegion>();
    const unmapped: HeatmapRegion[] = [];

    for (const region of regions) {
      const location = cityLocations[normalizeName(region.name)];
      if (!location) {
        unmapped.push(region);
        continue;
      }

      const [lat, lng] = location.coordinates;
      const id = `${lat}:${lng}`;
      const mapped = mappedByLocation.get(id);
      if (mapped) {
        mapped.count += region.count;
        mapped.sourceRegions.push(region);
      } else {
        mappedByLocation.set(id, {
          id,
          name: location.label,
          lat,
          lng,
          count: region.count,
          sourceRegions: [region],
        });
      }
    }

    const mapped = [...mappedByLocation.values()];

    return {
      mappedRegions: mapped,
      unmappedRegions: unmapped,
      unmappedOrders: unmapped.reduce((total, region) => total + region.count, 0),
      maxOrders: Math.max(1, ...mapped.map((region) => region.count)),
    };
  }, [regions]);

  return (
    <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d51100]/10 text-[#d51100]">
              <Flame className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold text-[#171717]">
              Heatmap Order per Wilayah
            </CardTitle>
            <Badge variant="outline" className="border-[#e5e5e5] text-[11px] text-[#5c5c5c]">
              Data aktual
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[#5c5c5c]">
            Titik memakai koordinat referensi wilayah; intensitas menunjukkan jumlah order, bukan
            lokasi pemasangan pelanggan. Gunakan scroll atau pinch touchpad untuk zoom.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1 text-[#171717]">
            <MapPin className="h-3.5 w-3.5 text-[#d51100]" />
            <span className="font-medium">{mappedRegions.length} lokasi di peta</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-1 text-[#5c5c5c]">
            <Layers className="h-3.5 w-3.5" />
            <span>Intensitas = jumlah order</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0">
        <div className="relative h-[440px] w-full overflow-hidden rounded-xl border border-[#e5e5e5]">
          <MapContainer
            center={[-8.1332, 113.2245]}
            zoom={8}
            scrollWheelZoom
            touchZoom
            className="z-0 h-full w-full"
          >
            <FitMapToRegions regions={mappedRegions} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mappedRegions.map((region) => {
              const intensity = region.count / maxOrders;
              const radius = 350 + intensity * 1800;
              return (
                <Circle
                  key={region.id}
                  center={[region.lat, region.lng]}
                  radius={radius}
                  pathOptions={{
                    color: "#d51100",
                    fillColor: "#d51100",
                    fillOpacity: 0.12 + intensity * 0.3,
                    weight: 1,
                  }}
                />
              );
            })}
            {mappedRegions.map((region) => (
              <CircleMarker
                key={`${region.id}-marker`}
                center={[region.lat, region.lng]}
                radius={5}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: "#d51100",
                  fillOpacity: 1,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold">{region.name}</p>
                    <p>{region.count.toLocaleString("id-ID")} order</p>
                    <p>{((region.count / maxOrders) * 100).toFixed(1)}% dari lokasi teratas</p>
                    {region.sourceRegions.length > 1 && (
                      <ul className="list-inside list-disc border-t pt-1">
                        {region.sourceRegions.map((sourceRegion) => (
                          <li key={sourceRegion.id}>
                            {sourceRegion.name} ({sourceRegion.source}):{" "}
                            {sourceRegion.count.toLocaleString("id-ID")} order
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          {mappedRegions.length === 0 && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80 px-6 text-center text-sm text-[#5c5c5c]">
              Belum ada kota pada data yang memiliki koordinat peta tersedia.
            </div>
          )}
        </div>
        {unmappedRegions.length > 0 && (
          <div className="space-y-1 text-xs text-[#737373]">
            <p>
              {unmappedOrders.toLocaleString("id-ID")} order belum dipetakan karena lokasinya belum
              memiliki koordinat yang dapat dipastikan:
            </p>
            <ul className="list-inside list-disc">
              {unmappedRegions.map((region) => (
                <li key={region.id}>
                  {region.name} ({region.source}) - {region.count.toLocaleString("id-ID")} order
                </li>
              ))}
            </ul>
            <p>Data tersebut tetap dihitung di tabel dan grafik; tidak diberi titik perkiraan.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

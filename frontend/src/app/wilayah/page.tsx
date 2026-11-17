"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Map as MapIcon,
  MapPin,
  ShoppingCart,
  Download,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { HeatmapPreview } from "@/components/dashboard/heatmap-preview";
import { fetchStats, type StatsResponse } from "@/lib/api";
import { exportToExcel } from "@/lib/excel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type WilayahOrderCount = {
  id: string;
  name: string;
  source: "Kota" | "DATEL";
  count: number;
};

function normalizeRegions(
  regions: StatsResponse["by_region"],
): WilayahOrderCount[] {
  return (regions ?? [])
    .filter(({ region_name }) => region_name.trim() !== "")
    .map(({ region_name, region_source, count }) => ({
      id: `${region_source}:${region_name.trim()}`,
      name: region_name.trim(),
      source: region_source,
      count: Number(count),
    }))
    .sort((a, b) => b.count - a.count);
}

export default function WilayahPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await fetchStats());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat data wilayah");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const nextStats = await fetchStats();
        if (active) setStats(nextStats);
      } catch (e: unknown) {
        if (active) {
          setError(e instanceof Error ? e.message : "Gagal memuat data wilayah");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const wilayahData = useMemo(() => normalizeRegions(stats?.by_region), [stats]);

  const filteredWilayah = useMemo(
    () =>
      wilayahData.filter((wilayah) =>
        `${wilayah.name} ${wilayah.source}`
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase()),
      ),
    [searchTerm, wilayahData],
  );
  const chartData = wilayahData.slice(0, 10).map((wilayah) => ({
    ...wilayah,
    label: `${wilayah.name} (${wilayah.source})`,
  }));
  const topWilayah = wilayahData[0];
  const datelFallbackOrders = wilayahData
    .filter((wilayah) => wilayah.source === "DATEL")
    .reduce((total, wilayah) => total + wilayah.count, 0);
  const totalMappedOrders = wilayahData.reduce(
    (total, wilayah) => total + wilayah.count,
    0,
  );
  const totalOrders = stats?.total_orders ?? 0;
  const ordersWithoutLocation = Math.max(0, totalOrders - totalMappedOrders);

  const handleExportExcel = () => {
    const exportData = filteredWilayah.map((wilayah, idx) => ({
      No: idx + 1,
      Wilayah: wilayah.name,
      Sumber: wilayah.source,
      "Total Order": wilayah.count,
      "Persentase dari Order Terpetakan (%)":
        totalMappedOrders > 0
          ? Number(((wilayah.count / totalMappedOrders) * 100).toFixed(1))
          : 0,
    }));
    exportToExcel(exportData, "Data_Cakupan_Wilayah");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Analisis Cakupan Wilayah
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Wilayah memakai kota jika tersedia per order, lalu menggunakan DATEL jika kota kosong.
            </p>
          </div>

          <Button
            onClick={handleExportExcel}
            disabled={loading || filteredWilayah.length === 0}
            className="h-10 rounded-xl bg-[#171717] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#171717]/85"
          >
            <Download className="mr-2 h-4 w-4 text-[#d51100]" />
            Export Excel (XLSX)
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadStats()}
              className="border-red-200 text-red-800 hover:bg-red-100"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Coba lagi
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Wilayah Terdata"
            value={loading ? "Memuat..." : error ? "-" : wilayahData.length.toLocaleString("id-ID")}
            description="gabungan kota dan DATEL"
            icon={MapIcon}
          />
          <StatCard
            title="Wilayah dengan Order Terbanyak"
            value={loading ? "Memuat..." : error ? "-" : topWilayah?.name ?? "-"}
            description={
              error
                ? "data tidak tersedia"
                : topWilayah
                  ? `${topWilayah.count.toLocaleString("id-ID")} order (${topWilayah.source})`
                  : "belum ada data wilayah"
            }
            icon={MapPin}
          />
          <StatCard
            title="Total Order"
            value={loading ? "Memuat..." : error ? "-" : totalOrders.toLocaleString("id-ID")}
            description="seluruh order pada data"
            icon={ShoppingCart}
          />
          <StatCard
            title="Order Memakai DATEL sebagai Pengganti"
            value={loading ? "Memuat..." : error ? "-" : datelFallbackOrders.toLocaleString("id-ID")}
            description="kota kosong, memakai DATEL"
            icon={MapPin}
          />
          <StatCard
            title="Order Tanpa Kota / DATEL"
            value={loading ? "Memuat..." : error ? "-" : ordersWithoutLocation.toLocaleString("id-ID")}
            description="tidak dapat dipetakan"
            icon={MapPin}
          />
        </div>

        <HeatmapPreview regions={wilayahData} />

        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#171717]">
              Distribusi Order per Wilayah
            </CardTitle>
            <p className="text-xs text-[#5c5c5c]">
              Kota dipakai jika tersedia; DATEL menjadi pengganti per order jika kota kosong.
              {` ${totalMappedOrders.toLocaleString("id-ID")} dari ${totalOrders.toLocaleString("id-ID")} order memiliki wilayah.`}
              {wilayahData.length > 10 && " Grafik menampilkan 10 wilayah teratas."}
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-[#5c5c5c]">
                Memuat data wilayah...
              </div>
            ) : error ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-[#5c5c5c]">
                Data grafik belum dapat dimuat.
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-[#5c5c5c]">
                Belum ada data kota atau DATEL untuk dipetakan.
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="label"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      height={50}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#5c5c5c" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#5c5c5c" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e5e5",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value} Order`, "Total"]}
                    />
                    <Bar dataKey="count" name="Total Order" fill="#171717" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#171717]">
                Tabel Order per Wilayah
              </CardTitle>
                <p className="text-xs text-[#5c5c5c]">
                  Persentase dihitung dari total order yang memiliki wilayah. Sumber wilayah ditampilkan per baris.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#5c5c5c]" />
              <input
                type="text"
                placeholder="Cari wilayah atau sumber..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 pl-9 pr-4 text-xs text-[#171717] outline-none transition placeholder:text-[#5c5c5c] focus:border-[#171717] focus:bg-white"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-4 py-3.5">Wilayah</th>
                    <th className="px-4 py-3.5">Sumber</th>
                    <th className="px-4 py-3.5 text-right">Total Order</th>
                    <th className="px-5 py-3.5 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-[#5c5c5c]">
                        Memuat data wilayah...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-red-700">
                        Data wilayah gagal dimuat. Coba muat ulang data.
                      </td>
                    </tr>
                  ) : filteredWilayah.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-[#5c5c5c]">
                        {wilayahData.length === 0
                          ? "Belum ada data kota atau DATEL untuk dipetakan."
                          : "Wilayah tidak ditemukan."}
                      </td>
                    </tr>
                  ) : (
                    filteredWilayah.map((wilayah, index) => (
                      <tr key={wilayah.id} className="transition-colors hover:bg-[#f9f9f9]">
                        <td className="px-5 py-3.5 text-xs text-[#5c5c5c]">{index + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#d51100]" />
                            <span className="text-xs font-semibold text-[#171717]">
                              {wilayah.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          {wilayah.source}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-bold text-[#171717]">
                          {wilayah.count.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-[#5c5c5c]">
                          {totalMappedOrders > 0
                            ? `${((wilayah.count / totalMappedOrders) * 100).toFixed(1)}%`
                            : "0%"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

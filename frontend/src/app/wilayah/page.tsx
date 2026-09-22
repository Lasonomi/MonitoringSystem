"use client";

import { useState } from "react";
import {
  Map,
  MapPin,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Search,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { HeatmapPreview } from "@/components/dashboard/heatmap-preview";
import { wilayahData, formatRupiah, formatShortRupiah } from "@/lib/dummy-data";
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

export default function WilayahPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWilayah = wilayahData.filter((w) =>
    w.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = wilayahData.map((w) => ({
    kecamatan: w.kecamatan,
    penjualan: w.penjualan,
    target: w.target,
  }));

  const handleExportExcel = () => {
    const exportData = filteredWilayah.map((w, idx) => ({
      No: idx + 1,
      Kecamatan: w.kecamatan,
      "Target Unit": w.target,
      "Realisasi Unit": w.penjualan,
      "Total Revenue (Rp)": w.revenue,
      "Jumlah Pelanggan": w.pelanggan,
      "Tingkat Penetrasi (%)": w.penetrasi,
    }));
    exportToExcel(exportData, "Data_Cakupan_Wilayah_Lumajang");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Analisis Cakupan Wilayah
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Distribusi penetrasi pasar, target unit penjualan, dan pemetaan jaringan di Kabupaten Lumajang
            </p>
          </div>

          <Button
            onClick={handleExportExcel}
            className="rounded-xl bg-[#171717] hover:bg-[#171717]/85 text-white font-semibold text-xs shadow-sm h-10 px-4"
          >
            <Download className="mr-2 h-4 w-4 text-[#d51100]" />
            Export Excel (XLSX)
          </Button>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Kecamatan"
            value="21 Wilayah"
            description="Kabupaten Lumajang"
            trend="100% Aktif"
            trendType="up"
            icon={Map}
          />
          <StatCard
            title="Penetrasi Tertinggi"
            value="Lumajang Kota"
            description="95,0% cakupan"
            trend="Terpadat"
            trendType="up"
            icon={MapPin}
          />
          <StatCard
            title="Total Pelanggan Terpasang"
            value="3.420"
            description="semua kecamatan"
            trend="+15,2%"
            trendType="up"
            icon={Users}
          />
          <StatCard
            title="Total Revenue Wilayah"
            value="Rp 845,2 Jt"
            description="kontribusi regional"
            trend="+8,7%"
            trendType="up"
            icon={DollarSign}
          />
        </div>

        {/* Interactive Map */}
        <div>
          <HeatmapPreview />
        </div>

        {/* Chart: Unit Penjualan per Kecamatan */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#171717]">
              Realisasi Penjualan Unit per Kecamatan
            </CardTitle>
            <p className="text-xs text-[#5c5c5c]">
              Volume penjualan produk internet pada masing-masing kecamatan
            </p>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="kecamatan"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={40}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#5c5c5c" }}
                  />
                  <YAxis
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
                    formatter={(val: any) => [`${val} Unit`, "Realisasi"]}
                  />
                  <Bar dataKey="penjualan" fill="#171717" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabel Data Wilayah */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-[#171717]">
                Tabel Statistik Cakupan Wilayah
              </CardTitle>
              <p className="text-xs text-[#5c5c5c]">
                Rincian target, realisasi, pendapatan, dan jumlah pelanggan per kecamatan
              </p>
            </div>

            <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#5c5c5c]" />
              <input
                type="text"
                placeholder="Cari kecamatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 pl-9 pr-4 text-xs text-[#171717] placeholder:text-[#5c5c5c] outline-none transition focus:border-[#171717] focus:bg-white"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                    <th className="px-5 py-3.5">Kecamatan</th>
                    <th className="px-4 py-3.5 text-center">Target Unit</th>
                    <th className="px-4 py-3.5 text-center">Realisasi Unit</th>
                    <th className="px-4 py-3.5 text-right">Total Revenue</th>
                    <th className="px-4 py-3.5 text-center">Pelanggan</th>
                    <th className="px-5 py-3.5 min-w-[150px]">Penetrasi (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {filteredWilayah.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f3f3] text-[#171717]">
                            <MapPin className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-[#171717]">
                              {item.kecamatan}
                            </p>
                            <p className="text-[10px] text-[#5c5c5c]">Kabupaten Lumajang</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs text-[#5c5c5c]">
                        {item.target} Unit
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-xs text-[#171717]">
                          {item.penjualan} Unit
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-semibold text-xs text-[#171717]">
                        {formatShortRupiah(item.revenue)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center rounded-full bg-[#f3f3f3] px-2.5 py-0.5 text-xs font-semibold text-[#171717]">
                          {item.pelanggan.toLocaleString("id-ID")}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-[#d51100]">
                              {item.penetrasi.toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={item.penetrasi}
                            className="h-1.5"
                            indicatorClassName={
                              item.penetrasi >= 90 ? "bg-[#d51100]" : "bg-[#171717]"
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState } from "react";
import {
  Trophy,
  Users,
  Target,
  Award,
  Download,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { sellerData, formatRupiah, formatShortRupiah, SellerPerformance } from "@/lib/dummy-data";
import { exportToExcel } from "@/lib/excel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SellerPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSellers = sellerData.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = sellerData.slice(0, 3);

  const chartData = sellerData.map((s) => ({
    name: s.name.split(" ")[0],
    Target: s.target,
    Realisasi: s.penjualan,
  }));

  const handleExportExcel = () => {
    const exportData = filteredSellers.map((s) => ({
      Rank: s.rank,
      "ID Seller": s.id,
      Nama: s.name,
      Wilayah: s.region,
      Email: s.email,
      Telepon: s.phone,
      "Penjualan Unit": s.penjualan,
      "Target Unit": s.target,
      "Total Revenue (Rp)": s.revenue,
      "Pencapaian (%)": s.progress,
      Status: s.status,
    }));
    exportToExcel(exportData, "Data_Performa_Seller");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Performa & Evaluasi Seller
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Peringkat, capaian target unit, dan leaderboard tim marketing lapangan
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Seller Aktif"
            value="24 Orang"
            description="lapangan & telesales"
            trend="+2 Baru"
            trendType="up"
            icon={Users}
          />
          <StatCard
            title="Total Omzet Tim"
            value="Rp 845,2 Jt"
            description="bulan berjalan"
            trend="+8,7%"
            trendType="up"
            icon={Trophy}
          />
          <StatCard
            title="Rata-rata Target"
            value="96,4%"
            description="pencapaian tim"
            progress={96.4}
            icon={Target}
          />
          <StatCard
            title="Top Seller Bulan Ini"
            value="Budi Santoso"
            description="185 Unit (123%)"
            trend="Rank 1"
            trendType="up"
            icon={Award}
          />
        </div>

        {/* Top 3 Ranking Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {topThree.map((seller, index) => {
            const rankLabel = index === 0 ? "Juara 1" : index === 1 ? "Juara 2" : "Juara 3";
            const badgeColor =
              index === 0
                ? "bg-[#171717] text-white"
                : index === 1
                ? "bg-[#5c5c5c] text-white"
                : "bg-[#d51100] text-white";

            return (
              <Card
                key={seller.id}
                className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-[0_4px_20px_rgba(23,23,23,0.05)] relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-[#171717] text-sm font-bold text-white">
                        {seller.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-[#171717]">{seller.name}</h3>
                      </div>
                      <p className="text-xs text-[#5c5c5c]">{seller.region}</p>
                    </div>
                  </div>

                  <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${badgeColor}`}>
                    #{seller.rank} {rankLabel}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#f5f5f5] p-3 text-xs">
                  <div>
                    <span className="text-[11px] text-[#5c5c5c]">Unit Terjual:</span>
                    <p className="font-bold text-sm text-[#171717]">{seller.penjualan} Unit</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5c5c5c]">Total Revenue:</span>
                    <p className="font-bold text-sm text-[#d51100]">
                      {formatShortRupiah(seller.revenue)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#5c5c5c]">Target: {seller.target} Unit</span>
                    <span className="font-bold text-[#d51100]">{seller.progress.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min(seller.progress, 100)}
                    className="h-2"
                    indicatorClassName="bg-[#d51100]"
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Target vs Realization Chart */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#171717]">
              Komparasi Target vs Realisasi Penjualan Seller
            </CardTitle>
            <p className="text-xs text-[#5c5c5c]">
              Perbandingan kuantitatif unit target terhadap pencapaian riil marketing
            </p>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
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
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="Target" fill="#e5e5e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Realisasi" fill="#171717" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Seller Performance Table */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-[#171717]">
                Tabel Seluruh Performa Seller
              </CardTitle>
              <p className="text-xs text-[#5c5c5c]">
                Daftar lengkap metrik penjualan per personel
              </p>
            </div>

            <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#5c5c5c]" />
              <input
                type="text"
                placeholder="Cari seller..."
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
                    <th className="px-5 py-3.5 text-center">Rank</th>
                    <th className="px-4 py-3.5">Nama Seller</th>
                    <th className="px-4 py-3.5">Wilayah Tugas</th>
                    <th className="px-4 py-3.5 text-center">Target</th>
                    <th className="px-4 py-3.5 text-center">Realisasi</th>
                    <th className="px-4 py-3.5 text-right">Revenue</th>
                    <th className="px-4 py-3.5 min-w-[140px]">Pencapaian</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f3f3] text-xs font-bold text-[#171717]">
                          {seller.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 rounded-lg border border-[#e5e5e5]">
                            <AvatarFallback className="bg-[#171717] text-xs font-bold text-white">
                              {seller.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-xs text-[#171717]">{seller.name}</p>
                            <p className="text-[11px] text-[#5c5c5c]">{seller.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                        {seller.region}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-[#5c5c5c]">
                        {seller.target} Unit
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-xs text-[#171717]">
                          {seller.penjualan} Unit
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-xs text-[#171717]">
                        {formatRupiah(seller.revenue)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-[#d51100]">
                              {seller.progress.toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(seller.progress, 100)}
                            className="h-1.5"
                            indicatorClassName={
                              seller.progress >= 100 ? "bg-[#d51100]" : "bg-[#171717]"
                            }
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {seller.status === "Top Performer" ? (
                          <Badge variant="destructive" className="bg-[#d51100]">
                            Top Performer
                          </Badge>
                        ) : seller.status === "Aktif" ? (
                          <Badge variant="success">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Cuti</Badge>
                        )}
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

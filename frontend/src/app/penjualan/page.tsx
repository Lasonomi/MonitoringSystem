"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  Download,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  transactionsData,
  dailyAnalyticsData,
  formatRupiah,
  Transaction,
} from "@/lib/dummy-data";
import { exportToExcel } from "@/lib/excel";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PenjualanPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-17");

  // Filter transactions based on search and status
  const filteredTransactions = useMemo(() => {
    return transactionsData.filter((trx) => {
      const matchSearch =
        trx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "Semua" ? true : trx.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  // Chart data within date range
  const chartData = useMemo(() => {
    return dailyAnalyticsData.filter(
      (d) => d.date >= startDate && d.date <= endDate
    );
  }, [startDate, endDate]);

  const handleExportExcel = () => {
    const exportData = filteredTransactions.map((t, idx) => ({
      No: idx + 1,
      "ID Transaksi": t.id,
      "Nama Pelanggan": t.customerName,
      Instansi: t.institution,
      "Paket Layanan": t.packageName,
      Tanggal: t.date,
      "Nominal (Rp)": t.amount,
      Status: t.status,
      Seller: t.sellerName,
      Wilayah: t.region,
    }));
    exportToExcel(exportData, `Data_Penjualan_${startDate}_${endDate}`);
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "Selesai":
        return <Badge variant="success">Selesai</Badge>;
      case "Proses":
        return <Badge variant="warning">Proses</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Batal":
        return <Badge variant="destructive">Batal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Dashboard Penjualan
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Monitoring transaksi, volume penjualan paket internet, dan realisasi pendapatan
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
            title="Total Transaksi"
            value="1.250"
            description="dari bulan lalu"
            trend="+12,4%"
            trendType="up"
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Revenue"
            value="Rp 845,2 Jt"
            description="target tercapai"
            trend="+8,7%"
            trendType="up"
            icon={DollarSign}
          />
          <StatCard
            title="Rata-rata Order (AOV)"
            value="Rp 676.160"
            description="per invoice"
            trend="+4,2%"
            trendType="up"
            icon={TrendingUp}
          />
          <StatCard
            title="Tingkat Konversi"
            value="94,2%"
            description="transaksi selesai"
            progress={94.2}
            icon={CheckCircle2}
          />
        </div>

        {/* Sales Trend Chart */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-[#171717]">
                Tren Pertumbuhan Penjualan Harian
              </CardTitle>
              <p className="text-xs text-[#5c5c5c]">
                Grafik fluktuasi unit penjualan dalam periode berjalan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1.5 text-[#5c5c5c]">
                <Calendar className="h-3.5 w-3.5 text-[#171717]" />
                <label htmlFor="pj-start" className="font-medium text-[#171717]">Dari:</label>
                <input
                  id="pj-start"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs text-[#171717] outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1.5 text-[#5c5c5c]">
                <label htmlFor="pj-end" className="font-medium text-[#171717]">Sampai:</label>
                <input
                  id="pj-end"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs text-[#171717] outline-none cursor-pointer"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="penjualanColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#171717" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
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
                    formatter={(value: any) => [`${value} Unit`, "Penjualan"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="penjualan"
                    stroke="#171717"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#penjualanColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table Section */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#171717]">
                  Daftar Riwayat Transaksi
                </CardTitle>
                <p className="text-xs text-[#5c5c5c]">
                  Menampilkan {filteredTransactions.length} transaksi terakhir
                </p>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#5c5c5c]" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan pelanggan, ID transaksi, paket, seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 pl-9 pr-4 text-xs text-[#171717] placeholder:text-[#5c5c5c] outline-none transition focus:border-[#171717] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#5c5c5c]" />
                <span className="text-xs font-medium text-[#5c5c5c]">Status:</span>
                <div className="flex flex-wrap gap-1">
                  {["Semua", "Selesai", "Proses", "Pending", "Batal"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        statusFilter === st
                          ? "bg-[#171717] text-white"
                          : "bg-[#f3f3f3] text-[#5c5c5c] hover:bg-[#e5e5e5]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                    <th className="px-5 py-3.5">ID Transaksi</th>
                    <th className="px-4 py-3.5">Pelanggan</th>
                    <th className="px-4 py-3.5">Paket Layanan</th>
                    <th className="px-4 py-3.5">Tanggal</th>
                    <th className="px-4 py-3.5 text-right">Nominal</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5">Seller</th>
                    <th className="px-5 py-3.5">Wilayah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {filteredTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#171717]">
                        {item.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-xs text-[#171717]">
                          {item.customerName}
                        </p>
                        <p className="text-[11px] text-[#5c5c5c]">{item.institution}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-[#f3f3f3] px-2 py-0.5 text-xs text-[#171717]">
                          {item.packageName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                        {item.date}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-xs text-[#171717]">
                        {formatRupiah(item.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#171717]">
                        {item.sellerName}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#5c5c5c]">
                        {item.region}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[#5c5c5c]">
                        Tidak ada transaksi yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
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

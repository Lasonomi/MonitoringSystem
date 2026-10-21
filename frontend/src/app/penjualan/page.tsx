"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  TrendingUp,
  ShoppingCart,
  CheckCircle2,
  CircleDollarSign,
  UserPlus,
  Download,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartSkeleton, KpiSkeleton, TableSkeletonRows } from "@/components/ui/skeleton";
import {
  fetchOrders,
  fetchStats,
  fetchMeta,
  fetchUploadReportSummary,
  type OrderRecord,
  type StatsResponse,
  type MetaResponse,
  type UploadReportSummary,
} from "@/lib/api";
import { exportToExcel } from "@/lib/excel";
import { formatShortRupiah } from "@/lib/dummy-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "").toLowerCase();
  if (s.includes("sukses") || s.includes("selesai") || s.includes("done") || s.includes("complete") || s.includes("success"))
    return <Badge variant="success">{status}</Badge>;
  if (s.includes("proses") || s.includes("process") || s.includes("progress") || s.includes("pending"))
    return <Badge variant="warning">{status}</Badge>;
  if (s.includes("batal") || s.includes("cancel") || s.includes("gagal") || s.includes("failed"))
    return <Badge variant="destructive">{status}</Badge>;
  return <Badge variant="secondary">{status ?? "-"}</Badge>;
}

function formatOrderDate(value: string | null) {
  if (!value) return "-";
  const date = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return date ? `${date[3]}/${date[2]}/${date[1]}` : value;
}

export default function PenjualanPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  // API state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [chartStats, setChartStats] = useState<StatsResponse | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [reportSummary, setReportSummary] = useState<UploadReportSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PER_PAGE = 50;

  // ─── Fetch meta (status options, cities) ────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchMeta(), fetchUploadReportSummary()])
      .then(([nextMeta, summary]) => {
        setMeta(nextMeta);
        setReportSummary(summary);
      })
      .catch(console.error);
  }, []);

  // ─── Fetch stats ─────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await fetchStats({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate]);

  const loadChartStats = useCallback(async () => {
    setChartLoading(true);
    try {
      const chartYearStats = await fetchStats({
        start_date: `${chartYear}-01-01`,
        end_date: `${chartYear}-12-31`,
      });
      setChartStats(chartYearStats);
    } catch (e) {
      console.error("Gagal memuat grafik bulanan:", e);
    } finally {
      setChartLoading(false);
    }
  }, [chartYear]);

  // ─── Fetch orders ────────────────────────────────────────────────────────────
  const loadOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrders({
        search: searchTerm || undefined,
        status: statusFilter !== "Semua" ? statusFilter : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        per_page: PER_PAGE,
        page,
      });
      setOrders(res.data);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
      setTotalOrders(res.meta.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, startDate, endDate]);

  useEffect(() => {
    loadOrders(1);
    loadStats();
  }, [loadOrders, loadStats]);

  useEffect(() => {
    loadChartStats();
  }, [loadChartStats]);

  // ─── Monthly chart data ───────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const monthlyTotals = Array<number>(12).fill(0);
    for (const day of chartStats?.by_date ?? []) {
      const monthIndex = Number(day.date.slice(5, 7)) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyTotals[monthIndex] += day.count;
      }
    }

    return monthlyTotals.map((penjualan, monthIndex) => ({
      month: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
        new Date(chartYear, monthIndex, 1),
      ),
      penjualan,
    }));
  }, [chartStats, chartYear]);

  const chartYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear - index);
  }, []);

  // ─── Status filter options ────────────────────────────────────────────────────
  const statusOptions = useMemo(() => {
    const fromMeta = meta?.statuses ?? [];
    return ["Semua", ...fromMeta];
  }, [meta]);

  // ─── KPI dari stats ───────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    if (!stats) return null;
    const total = stats.all_total_orders;
    const selesai = stats.all_payable_orders;

    const conversionRate = total > 0 ? ((selesai / total) * 100).toFixed(1) : "0.0";
    const topServiceType = stats.by_service_type?.[0]?.jenis_layanan ?? "-";

    return { total, selesai, conversionRate, topServiceType };
  }, [stats]);

  // ─── Export Excel ─────────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    const exportData = orders.map((o, idx) => ({
      No: (currentPage - 1) * PER_PAGE + idx + 1,
      "Order ID": o.order_id ?? "-",
      STO: o.sto ?? "-",
      DATEL: o.datel ?? "-",
      "Type Transaksi": o.type_transaksi ?? "-",
      Status: o.status ?? "-",
      "Order Date": o.order_date ?? "-",
      "Nama Pelanggan": o.cust_name ?? "-",
      Alamat: o.cust_address ?? "-",
      Kota: o.city_name ?? "-",
      "Jenis Layanan": o.jenis_layanan ?? "-",
      Kecepatan: o.speed_package ?? "-",
    }));
    exportToExcel(exportData, `Data_Penjualan_${startDate || "all"}_${endDate || "all"}`);
  };

  // ─── Has data? ────────────────────────────────────────────────────────────────
  const hasData = meta?.has_data ?? false;

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
              Data real dari file Excel yang diupload · {totalOrders.toLocaleString("id-ID")} order ditemukan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => { loadOrders(1); loadStats(); loadChartStats(); }}
              variant="outline"
              className="h-10 rounded-xl border-[#e5e5e5] px-3 text-xs"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={orders.length === 0}
              className="rounded-xl bg-[#171717] hover:bg-[#171717]/85 text-white font-semibold text-xs shadow-sm h-10 px-4"
            >
              <Download className="mr-2 h-4 w-4 text-[#d51100]" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* No data banner */}
        {!hasData && !loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Belum ada data order</p>
              <p className="text-xs text-amber-700">
                Upload file Excel di halaman <strong>Laporan &amp; Export</strong> untuk mulai menampilkan data nyata.
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 7 }, (_, index) => <KpiSkeleton key={index} />)}
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={
              stats?.amount_orders
                ? formatShortRupiah(stats.total_revenue)
                : "N/A"
            }
            description={
              stats?.amount_orders
                ? "total nominal tagihan pada periode"
                : "data TAGIHAN belum tersedia"
            }
            icon={CircleDollarSign}
          />
          <StatCard
            title="Pelanggan Baru"
            value={
              reportSummary?.latest?.identified_customers
                ? reportSummary.latest.new_customers.toLocaleString("id-ID")
                : "N/A"
            }
            description="Customer ID baru pada upload terakhir"
            icon={UserPlus}
          />
          <StatCard
            title="Pertumbuhan Penjualan"
            value={
              reportSummary?.growth_percent == null
                ? "N/A"
                : `${reportSummary.growth_percent > 0 ? "+" : ""}${reportSummary.growth_percent.toFixed(1)}%`
            }
            description="total TAGIHAN upload ini vs sebelumnya"
            trendType={reportSummary?.growth_percent != null && reportSummary.growth_percent < 0 ? "down" : "up"}
            icon={TrendingUp}
          />
          <StatCard
            title="Total Order"
            value={statsLoading || !meta ? "..." : meta.total_orders.toLocaleString("id-ID")}
            description="dari seluruh data"
            icon={ShoppingCart}
          />
          <StatCard
            title="Order Selesai"
            value={statsLoading ? "..." : (kpi?.selesai ?? 0).toLocaleString("id-ID")}
            description="status PAYABLE"
            icon={CheckCircle2}
          />
          <StatCard
            title="Top Jenis Layanan"
            value={statsLoading ? "..." : (kpi?.topServiceType ?? "-")}
            description="jenis layanan terbanyak"
            icon={TrendingUp}
          />
          <StatCard
            title="Tingkat Konversi"
            value={statsLoading ? "..." : `${kpi?.conversionRate ?? "0"}%`}
            description="PAYABLE ÷ seluruh order"
            progress={parseFloat(kpi?.conversionRate ?? "0")}
            icon={CheckCircle2}
          />
        </div>
        )}

        {/* Sales Trend Chart */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-[#171717]">
                Penjualan Unit per Bulan
              </CardTitle>
              <p className="text-xs text-[#5c5c5c]">
                Jumlah order per bulan pada tahun {chartYear}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-[#171717]" />
              <label htmlFor="chart-year" className="font-medium text-[#171717]">Tahun:</label>
              <select
                id="chart-year"
                value={chartYear}
                onChange={(e) => setChartYear(Number(e.target.value))}
                className="h-9 rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] px-3 text-xs text-[#171717] outline-none focus:border-[#171717]"
              >
                {chartYearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              {chartLoading ? (
                <ChartSkeleton />
              ) : chartData.every((month) => month.penjualan === 0) ? (
                <div className="flex h-full items-center justify-center text-xs text-[#5c5c5c]">
                  Tidak ada data untuk ditampilkan
                </div>
              ) : (
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
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#5c5c5c" }}
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
                      cursor={{ stroke: "#5c5c5c", strokeWidth: 1 }}
                      formatter={(value) => [`${value ?? 0} Order`, "Penjualan"]}
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#171717]">
                  Daftar Order
                </CardTitle>
                <p className="text-xs text-[#5c5c5c]">
                  Menampilkan {orders.length} dari {totalOrders.toLocaleString("id-ID")} order
                  {currentPage < totalPages && ` · Halaman ${currentPage}/${totalPages}`}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#5c5c5c]" />
                <input
                  type="text"
                  placeholder="Cari order ID, ID pelanggan, nama pelanggan, DATEL, STO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 pl-9 pr-4 text-xs text-[#171717] placeholder:text-[#5c5c5c] outline-none transition focus:border-[#171717] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#5c5c5c]" />
                <span className="text-xs font-medium text-[#5c5c5c]">Status:</span>
                <div className="flex flex-wrap gap-1">
                  {statusOptions.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${statusFilter === st
                        ? "bg-[#171717] text-white"
                        : "bg-[#f3f3f3] text-[#5c5c5c] hover:bg-[#e5e5e5]"
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-[#171717]" />
                <label htmlFor="orders-start" className="font-medium text-[#5c5c5c]">Tanggal:</label>
                <input
                  id="orders-start"
                  type="date"
                  aria-label="Tanggal awal daftar order"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] px-2 text-xs text-[#171717] outline-none focus:border-[#171717]"
                />
                <span className="text-[#5c5c5c]">s.d.</span>
                <input
                  id="orders-end"
                  type="date"
                  aria-label="Tanggal akhir daftar order"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] px-2 text-xs text-[#171717] outline-none focus:border-[#171717]"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                    <th className="px-4 py-3.5">Order ID</th>
                    <th className="px-4 py-3.5">STO</th>
                    <th className="px-4 py-3.5">DATEL</th>
                    <th className="px-4 py-3.5">Type Transaksi</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5">Order Date</th>
                    <th className="px-4 py-3.5">Nama Pelanggan</th>
                    <th className="px-4 py-3.5">Alamat</th>
                    <th className="px-4 py-3.5">Kota</th>
                    <th className="px-4 py-3.5">Jenis Layanan</th>
                  </tr>
                </thead>
                <tbody aria-busy={loading} className="divide-y divide-[#f0f0f0]">
                  {loading ? (
                    <TableSkeletonRows rows={6} columns={10} />
                  ) : error ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center">
                        <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
                        <p className="mt-2 text-xs text-red-500">{error}</p>
                        <button
                          onClick={() => loadOrders(currentPage)}
                          className="mt-2 text-xs font-medium text-[#171717] underline"
                        >
                          Coba lagi
                        </button>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-xs text-[#5c5c5c]">
                        Tidak ada data yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    orders.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f9f9f9] transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#171717]">
                          {item.order_id ?? "-"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          {item.sto ?? "-"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          {item.datel ?? "-"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          {item.type_transaksi ?? "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={item.payment_status ?? item.status} />
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          {formatOrderDate(item.order_date)}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-xs text-[#171717]">
                            {item.cust_name ?? "-"}
                          </p>
                        </td>
                        <td className="max-w-[200px] px-4 py-3.5 text-xs text-[#5c5c5c] truncate">
                          {item.cust_address ?? "-"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          {item.city_name ?? "-"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col items-start gap-1">
                            <span className="rounded-md bg-[#f3f3f3] px-2 py-0.5 text-xs text-[#171717]">
                              {item.jenis_layanan ?? "-"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#e5e5e5] px-5 py-3">
                <p className="text-xs text-[#5c5c5c]">
                  Halaman <span className="font-semibold text-[#171717]">{currentPage}</span> dari{" "}
                  <span className="font-semibold text-[#171717]">{totalPages}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || loading}
                    onClick={() => loadOrders(currentPage - 1)}
                    className="h-8 rounded-lg px-3 text-xs border-[#e5e5e5]"
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => loadOrders(currentPage + 1)}
                    className="h-8 rounded-lg px-3 text-xs border-[#e5e5e5]"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

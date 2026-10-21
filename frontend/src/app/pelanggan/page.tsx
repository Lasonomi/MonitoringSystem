"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { KpiSkeleton, TableSkeletonRows } from "@/components/ui/skeleton";
import {
  fetchOrders,
  fetchStats,
  fetchMeta,
  fetchUploadReportSummary,
  type OrderRecord,
  type UploadReportSummary,
} from "@/lib/api";
import { exportToExcel } from "@/lib/excel";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "").toLowerCase();
  if (
    s.includes("sukses") ||
    s.includes("selesai") ||
    s.includes("done") ||
    s.includes("complete") ||
    s.includes("success") ||
    s.includes("aktif")
  )
    return <Badge variant="success">{status}</Badge>;
  if (s.includes("proses") || s.includes("process") || s.includes("progress"))
    return <Badge variant="warning">{status}</Badge>;
  if (
    s.includes("batal") ||
    s.includes("cancel") ||
    s.includes("gagal") ||
    s.includes("failed")
  )
    return <Badge variant="destructive">{status}</Badge>;
  if (s.includes("pending") || s.includes("menunggu"))
    return <Badge variant="secondary">{status}</Badge>;
  return <Badge variant="outline">{status ?? "-"}</Badge>;
}

function formatOrderDate(value: string | null) {
  if (!value) return "-";
  const date = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return date ? `${date[3]}/${date[2]}/${date[1]}` : value;
}

export default function PelangganPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [cityFilter, setCityFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  // API state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reportSummary, setReportSummary] = useState<UploadReportSummary | null>(null);

  // Meta
  const [statuses, setStatuses] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [statsData, setStatsData] = useState<{
    total: number;
    selesai: number;
    paid: number;
    unpaid: number;
  } | null>(null);

  // ─── Load meta + stats ────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchMeta(), fetchStats(), fetchUploadReportSummary()])
      .then(([m, s, report]) => {
        setStatuses(m.payment_statuses);
        setCities(m.cities);
        setReportSummary(report);
        setStatsData({
          total: s.total_orders,
          selesai: s.paid_orders,
          paid: s.paid_orders,
          unpaid: s.unpaid_orders,
        });
      })
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  // ─── Load orders ──────────────────────────────────────────────────────────────
  const loadOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchOrders({
          search: searchTerm || undefined,
          payment_status: statusFilter !== "Semua" ? statusFilter : undefined,
          city: cityFilter !== "Semua" ? cityFilter : undefined,
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
    },
    [searchTerm, statusFilter, cityFilter]
  );

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  // ─── Export ───────────────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    try {
      // Export halaman ini saja
      const exportData = orders.map((o, idx) => ({
        No: (currentPage - 1) * PER_PAGE + idx + 1,
        "Order ID": o.order_id ?? "",
        STO: o.sto ?? "",
        DATEL: o.datel ?? "",
        "Type Transaksi": o.type_transaksi ?? "",
        Status: o.status ?? "",
        "Order Date": formatOrderDate(o.order_date),
        "Nama Pelanggan": o.cust_name ?? "",
        Alamat: o.cust_address ?? "",
        Kota: o.city_name ?? "",
        "Jenis Layanan": o.jenis_layanan ?? "",
      }));
      exportToExcel(exportData, "Data_Pelanggan_Order");
    } catch (e) {
      alert("Gagal export: " + (e instanceof Error ? e.message : ""));
    }
  };

  const statusOptions = useMemo(() => ["Semua", ...statuses], [statuses]);
  const cityOptions = useMemo(() => ["Semua", ...cities], [cities]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Database Pelanggan (Order)
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Data pelanggan dari file Excel yang diupload ·{" "}
              {loading ? "Memuat data..." : `${totalOrders.toLocaleString("id-ID")} record ditemukan`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => loadOrders(currentPage)}
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
        {!loading && !statsLoading && statsData?.total === 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Belum ada data pelanggan
              </p>
              <p className="text-xs text-amber-700">
                Upload file Excel di halaman{" "}
                <strong>Laporan &amp; Export</strong> terlebih dahulu.
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <KpiSkeleton key={index} />)}
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Order"
            value={statsData ? statsData.total.toLocaleString("id-ID") : "..."}
            description="seluruh data"
            icon={Users}
          />
          <StatCard
            title="Order Selesai"
            value={statsData ? statsData.selesai.toLocaleString("id-ID") : "..."}
            description="status PAYABLE"
            icon={Users}
          />
          <StatCard
            title="Kota Unik"
            value={cities.length > 0 ? cities.length.toLocaleString("id-ID") : "..."}
            description="area layanan"
            icon={Users}
          />
          <StatCard
            title="Completion Rate"
            value={
              statsData && statsData.total > 0
                ? `${((statsData.selesai / statsData.total) * 100).toFixed(1)}%`
                : "0%"
            }
            description="PAYABLE ÷ seluruh order"
            progress={
              statsData && statsData.total > 0
                ? (statsData.selesai / statsData.total) * 100
                : 0
            }
            icon={Users}
          />
          <StatCard
            title="Sudah Bayar"
            value={
              statsData && statsData.paid + statsData.unpaid > 0
                ? statsData.paid.toLocaleString("id-ID")
                : "N/A"
            }
            description="status PAYABLE"
            icon={Users}
          />
          <StatCard
            title="Belum Bayar"
            value={
              statsData && statsData.paid + statsData.unpaid > 0
                ? statsData.unpaid.toLocaleString("id-ID")
                : "N/A"
            }
            description="NONPAYABLE / BELUM BAYAR"
            icon={Users}
          />
          <StatCard
            title="Pelanggan Baru"
            value={
              reportSummary?.latest?.identified_customers
                ? reportSummary.latest.new_customers.toLocaleString("id-ID")
                : "N/A"
            }
            description="Customer ID baru pada upload terakhir"
            icon={Users}
          />
        </div>
        )}

        {/* Table */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#171717]">
                  Daftar Pelanggan / Order
                </CardTitle>
                <p className="text-xs text-[#5c5c5c]">
                  Menampilkan {orders.length} dari {totalOrders.toLocaleString("id-ID")} data
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#5c5c5c]" />
                <input
                  type="text"
                  placeholder="Cari nama pelanggan, ID pelanggan, DATEL, STO..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 pl-9 pr-4 text-xs text-[#171717] placeholder:text-[#5c5c5c] outline-none transition focus:border-[#171717] focus:bg-white"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#5c5c5c] shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 px-3 text-xs text-[#171717] outline-none cursor-pointer focus:border-[#171717] focus:bg-white"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s === "Semua" ? "Semua Status" : `Status: ${s}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 px-3 text-xs text-[#171717] outline-none cursor-pointer focus:border-[#171717] focus:bg-white"
                >
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === "Semua" ? "Semua Kota" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                    <th className="px-4 py-3.5">Order ID</th>
                    <th className="px-4 py-3.5">Nama Pelanggan</th>
                    <th className="px-4 py-3.5">Kota</th>
                    <th className="px-4 py-3.5">Jenis Layanan</th>
                    <th className="px-4 py-3.5">STO / DATEL</th>
                    <th className="px-4 py-3.5">Type Transaksi</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-center">Order Date</th>
                  </tr>
                </thead>
                <tbody aria-busy={loading} className="divide-y divide-[#f0f0f0]">
                  {loading ? (
                    <TableSkeletonRows rows={6} columns={8} />
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center">
                        <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
                        <p className="mt-2 text-xs text-red-500">{error}</p>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-xs text-[#5c5c5c]"
                      >
                        Tidak ada data yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-[#f5f5f5] transition-all duration-150 group"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#171717] group-hover:text-[#d51100] transition-colors duration-150">
                          {o.order_id ?? "-"}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-xs text-[#171717]">
                            {o.cust_name ?? "-"}
                          </p>
                          <p className="text-[11px] text-[#5c5c5c] truncate max-w-[200px]">
                            {o.cust_address ?? ""}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          {o.city_name ?? "-"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col items-start gap-1">
                            <span className="rounded-md bg-[#f3f3f3] px-2 py-0.5 text-xs font-medium text-[#171717] group-hover:bg-[#171717] group-hover:text-white transition-colors duration-150">
                              {o.jenis_layanan ?? "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          <span>{o.sto ?? "-"}</span>
                          {o.datel && (
                            <span className="ml-1 text-[10px] text-[#9c9c9c]">
                              / {o.datel}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                          {o.type_transaksi ?? "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={o.payment_status ?? o.status} />
                        </td>
                        <td className="px-4 py-3.5 text-center text-xs text-[#5c5c5c]">
                          {formatOrderDate(o.order_date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-[#e5e5e5] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#5c5c5c]">
                Halaman{" "}
                <span className="font-semibold text-[#171717]">{currentPage}</span>{" "}
                dari{" "}
                <span className="font-semibold text-[#171717]">{totalPages}</span>
                {" "}· Total{" "}
                <span className="font-semibold text-[#171717]">
                  {totalOrders.toLocaleString("id-ID")}
                </span>{" "}
                data
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || loading}
                  onClick={() => loadOrders(currentPage - 1)}
                  className="h-8 rounded-lg px-2 text-xs border-[#e5e5e5] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page buttons — max 5 visible */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5) {
                    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    page = start + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => loadOrders(page)}
                      disabled={loading}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        currentPage === page
                          ? "bg-[#171717] text-white"
                          : "border border-[#e5e5e5] bg-white text-[#5c5c5c] hover:bg-[#f3f3f3] hover:-translate-y-0.5"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => loadOrders(currentPage + 1)}
                  className="h-8 rounded-lg px-2 text-xs border-[#e5e5e5] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

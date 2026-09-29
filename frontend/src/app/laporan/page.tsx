"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Upload,
  AlertCircle,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  ShoppingCart,
  MapPin,
  Package,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  uploadOrders,
  fetchOrders,
  fetchStats,
  fetchMeta,
  clearOrders,
  type StatsResponse,
  type MetaResponse,
} from "@/lib/api";
import { exportToExcel } from "@/lib/excel";

// ─── Upload status ─────────────────────────────────────────────────────────────
type UploadStatus = "idle" | "uploading" | "success" | "error";

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LaporanPage() {
  // Upload state
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState<{
    imported: number;
    skipped: number;
    columns: string[];
    message: string;
  } | null>(null);

  // Data state
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  // ─── Fetch dashboard data ───────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [s, m] = await Promise.all([fetchStats(), fetchMeta()]);
      setStats(s);
      setMeta(m);
    } catch (e) {
      console.error("Failed to load stats:", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ─── Upload handler ─────────────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    const validExts = [".xlsx", ".xls", ".csv"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      setUploadStatus("error");
      setUploadError(`Format tidak didukung. Gunakan: ${validExts.join(", ")}`);
      return;
    }

    setUploadFileName(file.name);
    setUploadStatus("uploading");
    setUploadResult(null);
    setUploadError("");

    try {
      const res = await uploadOrders(file);
      if (res.success) {
        setUploadResult({
          imported: res.imported ?? 0,
          skipped: res.skipped ?? 0,
          columns: res.columns ?? [],
          message: res.message,
        });
        setUploadStatus("success");
        // Refresh stats after successful upload
        loadStats();
      } else {
        setUploadStatus("error");
        setUploadError(res.message ?? "Upload gagal.");
      }
    } catch (e: unknown) {
      setUploadStatus("error");
      setUploadError(e instanceof Error ? e.message : "Upload gagal. Periksa koneksi server.");
    }
  }, [loadStats]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setUploadStatus("idle");
    setUploadResult(null);
    setUploadFileName("");
    setUploadError("");
  };

  // ─── Clear all orders ───────────────────────────────────────────────────────
  const handleClear = async () => {
    if (!confirm("Yakin ingin menghapus SEMUA data order dari database?")) return;
    setClearing(true);
    try {
      await clearOrders();
      await loadStats();
      handleReset();
    } catch (e) {
      alert("Gagal menghapus data: " + (e instanceof Error ? e.message : ""));
    } finally {
      setClearing(false);
    }
  };

  // ─── Export all orders ──────────────────────────────────────────────────────
  const handleExportAll = async () => {
    try {
      // Ambil semua data (max 2000 per halaman untuk performa)
      const res = await fetchOrders({ per_page: 200, page: 1 });
      const total = res.meta.total;
      const lastPage = res.meta.last_page;

      let allOrders = [...res.data];

      // Jika ada lebih dari satu halaman, ambil semua
      if (lastPage > 1) {
        const pages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2);
        const results = await Promise.all(
          pages.map((p) => fetchOrders({ per_page: 200, page: p }))
        );
        results.forEach((r) => {
          allOrders = [...allOrders, ...r.data];
        });
      }

      const exportData = allOrders.map((o, idx) => ({
        No: idx + 1,
        "Order ID": o.order_id ?? "",
        STO: o.sto ?? "",
        DATEL: o.datel ?? "",
        "Type Transaksi": o.type_transaksi ?? "",
        Status: o.status ?? "",
        "Order Date": o.order_date ?? "",
        "CUST NAME": o.cust_name ?? "",
        "CUST ADDRESS": o.cust_address ?? "",
        "CITY NAME": o.city_name ?? "",
        PACKAGE: o.package ?? "",
      }));

      exportToExcel(exportData, `Data_Orders_${new Date().toISOString().slice(0, 10)}`);
    } catch (e) {
      alert("Gagal export: " + (e instanceof Error ? e.message : ""));
    }
  };

  // ─── Render Upload Area ──────────────────────────────────────────────────────
  const renderUploadArea = () => {
    // SUCCESS
    if (uploadStatus === "success" && uploadResult) {
      return (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-emerald-800">
                  Upload Berhasil!
                </p>
                <p className="mt-0.5 text-xs text-emerald-700 truncate">
                  {uploadFileName}
                </p>
                <p className="mt-1 text-[11px] text-emerald-700">
                  <span className="font-bold">{uploadResult.imported.toLocaleString("id-ID")}</span> data diimport
                  {uploadResult.skipped > 0 && (
                    <span className="ml-2 text-amber-600">· {uploadResult.skipped} baris dilewati</span>
                  )}
                </p>

                {uploadResult.columns.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {uploadResult.columns.slice(0, 10).map((col, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-emerald-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Lagi
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ERROR
    if (uploadStatus === "error") {
      return (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700">Upload Gagal</p>
                <p className="text-[11px] text-red-500">{uploadError}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    // UPLOADING
    if (uploadStatus === "uploading") {
      return (
        <div className="rounded-2xl border-2 border-[#171717]/20 bg-[#fafafa] p-6">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute h-12 w-12 rounded-full border-2 border-[#171717]/10" />
              <div className="absolute h-12 w-12 rounded-full border-2 border-t-[#171717] animate-spin" />
              <FileSpreadsheet className="h-5 w-5 text-[#171717]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#171717]">
                Mengupload & Mengimport Data...
              </p>
              <p className="text-[11px] text-[#5c5c5c]">{uploadFileName}</p>
              <p className="mt-1 text-[10px] text-[#9c9c9c]">
                Mohon tunggu, data sedang diproses ke database
              </p>
            </div>
          </div>
        </div>
      );
    }

    // IDLE — drop zone
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-[#171717] bg-[#171717]/5 scale-[1.01]"
            : "border-[#d5d5d5] bg-white hover:border-[#171717]/50 hover:bg-[#fafafa]"
        }`}
      >
        <label className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
                isDragOver ? "bg-[#171717] text-white scale-110" : "bg-[#f3f3f3] text-[#5c5c5c]"
              }`}
            >
              <Upload className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#171717]">
                {isDragOver ? "Lepaskan file di sini" : "Seret file Excel ke sini atau klik untuk memilih"}
              </p>
              <p className="mt-1 text-xs text-[#5c5c5c]">
                Data akan langsung tersimpan ke{" "}
                <span className="font-semibold text-[#171717]">database</span> dan ditampilkan di seluruh dashboard
              </p>
              <p className="mt-0.5 text-[11px] text-[#9c9c9c]">
                Mendukung .xlsx, .xls, .csv — maks. 20 MB
              </p>
            </div>

            {/* Expected columns */}
            <div className="mt-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-left w-full max-w-md">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#5c5c5c]">
                Kolom yang diharapkan:
              </p>
              <div className="flex flex-wrap gap-1">
                {["ORDER ID", "STO", "DATEL", "TYPE TRANSAKSI", "STATUS", "ORDER DATE", "CUST NAME", "CUST ADDRESS", "CITY NAME", "PACKAGE"].map((col) => (
                  <span
                    key={col}
                    className="rounded-md border border-[#e5e5e5] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#171717]"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  };

  // ─── Stats summary cards ─────────────────────────────────────────────────────
  const totalOrders = stats?.total_orders ?? 0;
  const topCity = stats?.by_city?.[0];
  const topPackage = stats?.by_package?.[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Upload Data & Laporan
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Upload file Excel untuk mengisi database — data akan langsung tersedia di seluruh halaman
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={loadStats}
              variant="outline"
              className="h-10 rounded-xl border-[#e5e5e5] px-3 text-xs"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {meta?.has_data && (
              <>
                <Button
                  onClick={handleExportAll}
                  className="h-10 rounded-xl bg-[#171717] hover:bg-[#171717]/85 text-white font-semibold text-xs px-4"
                >
                  <Download className="mr-2 h-4 w-4 text-[#d51100]" />
                  Export Semua Order
                </Button>
                <Button
                  onClick={handleClear}
                  disabled={clearing}
                  variant="outline"
                  className="h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50 text-xs px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Database Status Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717]">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#5c5c5c]">Total Order</p>
              <p className="text-xl font-bold text-[#171717]">
                {statsLoading ? "..." : totalOrders.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#5c5c5c]">Top Kota</p>
              <p className="text-sm font-bold text-[#171717] truncate max-w-[150px]">
                {statsLoading ? "..." : (topCity ? `${topCity.city_name} (${topCity.count})` : "-")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#5c5c5c]">Top Paket</p>
              <p className="text-sm font-bold text-[#171717] truncate max-w-[150px]">
                {statsLoading ? "..." : (topPackage ? `${topPackage.package} (${topPackage.count})` : "-")}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#171717]">
              <Upload className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171717]">Upload File Excel</h2>
              <p className="text-[11px] text-[#5c5c5c]">
                Data lama akan ditimpa dengan data baru dari file yang diupload
              </p>
            </div>
          </div>

          {renderUploadArea()}
        </div>

        {/* Stats breakdown */}
        {meta?.has_data && stats && (
          <>
            {/* By Status */}
            {Object.keys(stats.by_status).length > 0 && (
              <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-[#171717]">
                    Breakdown Status Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.by_status).map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2"
                      >
                        <span className="text-xs font-semibold text-[#171717]">{status || "(kosong)"}</span>
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {count.toLocaleString("id-ID")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* By City — top 10 */}
            {stats.by_city.length > 0 && (
              <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-[#171717]">
                    Top 10 Kota / DATEL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.by_city.slice(0, 10).map((c) => {
                      const pct = totalOrders > 0 ? (c.count / totalOrders) * 100 : 0;
                      return (
                        <div key={c.city_name} className="flex items-center gap-3">
                          <p className="w-36 truncate text-xs font-medium text-[#171717]">
                            {c.city_name || "(kosong)"}
                          </p>
                          <div className="flex-1 rounded-full bg-[#f0f0f0] h-2">
                            <div
                              className="h-2 rounded-full bg-[#171717]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-semibold text-[#5c5c5c]">
                            {c.count.toLocaleString("id-ID")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* By Package — top 10 */}
            {stats.by_package.length > 0 && (
              <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-[#171717]">
                    Top 10 Paket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.by_package.slice(0, 10).map((p) => {
                      const pct = totalOrders > 0 ? (p.count / totalOrders) * 100 : 0;
                      return (
                        <div key={p.package} className="flex items-center gap-3">
                          <p className="w-48 truncate text-xs font-medium text-[#171717]">
                            {p.package || "(kosong)"}
                          </p>
                          <div className="flex-1 rounded-full bg-[#f0f0f0] h-2">
                            <div
                              className="h-2 rounded-full bg-[#d51100]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-semibold text-[#5c5c5c]">
                            {p.count.toLocaleString("id-ID")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Help section */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#171717]">
              <FileText className="h-4 w-4 text-[#5c5c5c]" />
              Panduan Format Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-[#5c5c5c]">
              Baris pertama harus berisi nama kolom. Sistem menerima berbagai variasi nama kolom (case-insensitive).
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                    <th className="px-4 py-2.5 font-semibold text-[#171717]">Kolom Utama</th>
                    <th className="px-4 py-2.5 font-semibold text-[#171717]">Nama Alternatif yang Diterima</th>
                    <th className="px-4 py-2.5 font-semibold text-[#171717]">Tipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {[
                    { col: "ORDER ID", alt: "Order_ID, ID Order, No Order", type: "Teks" },
                    { col: "STO", alt: "STO", type: "Teks" },
                    { col: "DATEL", alt: "DATEL", type: "Teks" },
                    { col: "TYPE TRANSAKSI", alt: "Type_Transaksi, Jenis Transaksi, Transaksi", type: "Teks" },
                    { col: "STATUS", alt: "Status", type: "Teks" },
                    { col: "ORDER DATE", alt: "Order_Date, Tanggal Order, Tanggal, Date", type: "Tanggal" },
                    { col: "CUST NAME", alt: "Cust_Name, Customer Name, Nama Pelanggan, Nama", type: "Teks" },
                    { col: "CUST ADDRESS", alt: "Cust_Address, Customer Address, Alamat", type: "Teks" },
                    { col: "CITY NAME", alt: "City_Name, Kota, Kecamatan, City", type: "Teks" },
                    { col: "PACKAGE", alt: "Paket, Paket Layanan, Product, Produk", type: "Teks" },
                  ].map((r) => (
                    <tr key={r.col}>
                      <td className="px-4 py-2.5 font-mono font-semibold text-[#171717]">{r.col}</td>
                      <td className="px-4 py-2.5 text-[#5c5c5c]">{r.alt}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
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

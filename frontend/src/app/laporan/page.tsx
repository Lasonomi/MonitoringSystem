"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  MapPin,
  Upload,
  Building2,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  transactionsData,
  dailyAnalyticsData,
  customersData,
  sellerData,
  wilayahData,
  formatRupiah,
} from "@/lib/dummy-data";
import { exportToExcel } from "@/lib/excel";

// ─── Types ────────────────────────────────────────────────────────────────────
type DataType =
  | "pelanggan"
  | "instansi"
  | "penjualan"
  | "seller"
  | "wilayah"
  | "unknown";

type UploadStatus = "idle" | "reading" | "detecting" | "success" | "error";

interface DetectionResult {
  type: DataType;
  label: string;
  confidence: number; // 0-100
  matchedColumns: string[];
  totalRows: number;
  columns: string[];
}

// ─── Column signature map untuk auto-detect ───────────────────────────────────
const COLUMN_SIGNATURES: Record<
  Exclude<DataType, "unknown">,
  { required: string[]; optional: string[]; label: string }
> = {
  pelanggan: {
    required: [],
    optional: [
      "nama pelanggan", "nama", "id pelanggan", "telepon", "phone",
      "paket", "kecepatan", "speed", "biaya bulanan", "tgl pasang",
      "status", "kecamatan", "alamat", "email",
    ],
    label: "Data Pelanggan",
  },
  instansi: {
    required: [],
    optional: [
      "instansi", "nama instansi", "kategori", "pic", "pic name",
      "pic phone", "active points", "total points", "contract end",
      "kontrak", "code", "kode",
    ],
    label: "Data Instansi",
  },
  penjualan: {
    required: [],
    optional: [
      "id transaksi", "transaksi", "nominal", "amount", "seller",
      "seller name", "tanggal", "date", "region", "wilayah",
      "package name", "paket", "institution",
    ],
    label: "Data Penjualan",
  },
  seller: {
    required: [],
    optional: [
      "id seller", "rank", "target", "pencapaian", "progress",
      "penjualan unit", "realisasi", "revenue", "region", "wilayah tugas",
      "status", "avatar", "email", "phone",
    ],
    label: "Data Seller",
  },
  wilayah: {
    required: [],
    optional: [
      "kecamatan", "penetrasi", "realisasi", "realisasi unit",
      "target unit", "total revenue", "jumlah pelanggan",
      "lat", "lng", "latitude", "longitude",
    ],
    label: "Data Wilayah",
  },
};

const TYPE_META: Record<
  Exclude<DataType, "unknown">,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  pelanggan:  { icon: Users,        color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  instansi:   { icon: Building2,    color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  penjualan:  { icon: TrendingUp,   color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200" },
  seller:     { icon: Briefcase,    color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
  wilayah:    { icon: MapPin,       color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200" },
};

// ─── Auto-detect function ─────────────────────────────────────────────────────
function detectDataType(columns: string[]): DetectionResult {
  const normalizedCols = columns.map((c) => c.toLowerCase().trim());

  let bestType: Exclude<DataType, "unknown"> = "pelanggan";
  let bestScore = -1;
  let bestMatched: string[] = [];

  for (const [type, sig] of Object.entries(COLUMN_SIGNATURES) as [
    Exclude<DataType, "unknown">,
    typeof COLUMN_SIGNATURES[keyof typeof COLUMN_SIGNATURES],
  ][]) {
    const allKeywords = [...sig.required, ...sig.optional];
    const matched = allKeywords.filter((kw) =>
      normalizedCols.some((col) => col.includes(kw) || kw.includes(col))
    );
    const score = matched.length;
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
      bestMatched = matched;
    }
  }

  const confidence = Math.min(
    100,
    Math.round((bestScore / Math.max(COLUMN_SIGNATURES[bestType].optional.length, 1)) * 100)
  );

  return {
    type: bestScore > 0 ? bestType : "unknown",
    label: bestScore > 0 ? COLUMN_SIGNATURES[bestType].label : "Tidak Dikenali",
    confidence,
    matchedColumns: bestMatched,
    totalRows: 0,
    columns,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("penjualan");
  const [period] = useState("September 2026");

  // Upload state
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<DetectionResult | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadError, setUploadError] = useState("");

  // ─── Process uploaded file ──────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    if (!file) return;

    const validExts = [".xlsx", ".xls", ".csv"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      setUploadStatus("error");
      setUploadError(`Format tidak didukung. Gunakan: ${validExts.join(", ")}`);
      return;
    }

    setUploadFileName(file.name);
    setUploadStatus("reading");
    setUploadResult(null);
    setUploadError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setUploadStatus("detecting");
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = (XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        }) as unknown) as unknown[][];

        const headers = (json[0] as string[]) ?? [];
        const totalRows = Math.max(0, json.length - 1);

        setTimeout(() => {
          const result = detectDataType(headers);
          result.totalRows = totalRows;
          setUploadResult(result);
          setUploadStatus("success");
        }, 600); // Short delay for "detecting" UX feel
      } catch {
        setUploadStatus("error");
        setUploadError("Gagal membaca file. Pastikan file tidak rusak atau dilindungi password.");
      }
    };
    reader.onerror = () => {
      setUploadStatus("error");
      setUploadError("Gagal membaca file dari sistem.");
    };
    reader.readAsArrayBuffer(file);
  }, []);

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

  // ─── Export handler ─────────────────────────────────────────────────────────
  const handleExportCurrentReport = () => {
    switch (activeTab) {
      case "penjualan": {
        const data = transactionsData.map((t, i) => ({
          No: i + 1,
          "ID Transaksi": t.id,
          Pelanggan: t.customerName,
          Instansi: t.institution,
          Paket: t.packageName,
          Tanggal: t.date,
          "Nominal (Rp)": t.amount,
          Status: t.status,
          Seller: t.sellerName,
          Wilayah: t.region,
        }));
        exportToExcel(data, `Laporan_Penjualan_${period.replace(/\s+/g, "_")}`);
        break;
      }
      case "revenue": {
        const data = dailyAnalyticsData.map((d, i) => ({
          No: i + 1,
          Tanggal: d.date,
          "Unit Terjual": d.penjualan,
          "Revenue (Rp)": d.revenue,
          "Occupancy (%)": d.occupancy,
        }));
        exportToExcel(data, `Laporan_Revenue_${period.replace(/\s+/g, "_")}`);
        break;
      }
      case "pelanggan": {
        const data = customersData.map((c, i) => ({
          No: i + 1,
          "ID Pelanggan": c.id,
          Nama: c.name,
          Wilayah: c.kecamatan,
          Paket: c.package,
          Kecepatan: c.speed,
          "Biaya Bulanan": c.monthlyFee,
          "Tgl Pasang": c.installDate,
          Status: c.status,
        }));
        exportToExcel(data, `Laporan_Pelanggan_${period.replace(/\s+/g, "_")}`);
        break;
      }
      case "seller": {
        const data = sellerData.map((s) => ({
          Rank: s.rank,
          "ID Seller": s.id,
          Nama: s.name,
          Wilayah: s.region,
          "Penjualan Unit": s.penjualan,
          "Target Unit": s.target,
          "Total Revenue (Rp)": s.revenue,
          "Pencapaian (%)": s.progress,
          Status: s.status,
        }));
        exportToExcel(data, `Laporan_Seller_${period.replace(/\s+/g, "_")}`);
        break;
      }
      case "wilayah": {
        const data = wilayahData.map((w) => ({
          Kecamatan: w.kecamatan,
          "Target Unit": w.target,
          "Realisasi Unit": w.penjualan,
          "Total Revenue (Rp)": w.revenue,
          "Jumlah Pelanggan": w.pelanggan,
          "Penetrasi (%)": w.penetrasi,
        }));
        exportToExcel(data, `Laporan_Wilayah_${period.replace(/\s+/g, "_")}`);
        break;
      }
    }
  };

  // ─── Upload Area render ─────────────────────────────────────────────────────
  const renderUploadArea = () => {
    // SUCCESS state
    if (uploadStatus === "success" && uploadResult) {
      const isUnknown = uploadResult.type === "unknown";
      const meta = !isUnknown
        ? TYPE_META[uploadResult.type as Exclude<DataType, "unknown">]
        : null;
      const DetectedIcon = meta?.icon ?? AlertCircle;

      return (
        <div className="animate-fade-in-up rounded-2xl border-2 border-[#e5e5e5] bg-white p-5 shadow-[0_4px_20px_rgba(23,23,23,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Detected type icon */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                  ${meta ? `${meta.bg} ${meta.color}` : "bg-red-50 text-red-500"}`}
              >
                <DetectedIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5c5c5c]">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Auto-terdeteksi sebagai:
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold
                      ${meta ? `${meta.bg} ${meta.color} border ${meta.border}` : "bg-red-50 text-red-600 border border-red-200"}`}
                  >
                    {uploadResult.label}
                  </span>
                  {!isUnknown && (
                    <span className="rounded-full bg-[#f3f3f3] px-2 py-0.5 text-[10px] font-semibold text-[#5c5c5c]">
                      {uploadResult.confidence}% cocok
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm font-semibold text-[#171717] truncate">
                  {uploadFileName}
                </p>
                <p className="text-[11px] text-[#5c5c5c]">
                  {uploadResult.totalRows.toLocaleString("id-ID")} baris data •{" "}
                  {uploadResult.columns.length} kolom ditemukan
                </p>

                {/* Matched columns chips */}
                {uploadResult.matchedColumns.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {uploadResult.columns.slice(0, 8).map((col, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-[#f5f5f5] border border-[#e5e5e5] px-1.5 py-0.5 text-[10px] font-medium text-[#5c5c5c]"
                      >
                        {col}
                      </span>
                    ))}
                    {uploadResult.columns.length > 8 && (
                      <span className="rounded-md bg-[#f5f5f5] border border-[#e5e5e5] px-1.5 py-0.5 text-[10px] font-medium text-[#5c5c5c]">
                        +{uploadResult.columns.length - 8} lainnya
                      </span>
                    )}
                  </div>
                )}

                {isUnknown && (
                  <p className="mt-2 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Struktur kolom tidak cocok dengan format yang dikenal. Periksa kembali file Anda.
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 flex-col items-end gap-2">
              {!isUnknown && (
                <Button
                  size="sm"
                  className="h-8 rounded-xl bg-[#171717] hover:bg-[#171717]/85 text-white text-xs font-semibold px-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                  Simpan Data
                </Button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-[#5c5c5c] hover:text-[#d51100] transition-colors duration-150"
              >
                <X className="h-3.5 w-3.5" />
                Upload Baru
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ERROR state
    if (uploadStatus === "error") {
      return (
        <div className="animate-fade-in-up rounded-2xl border-2 border-red-200 bg-red-50 p-5">
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

    // READING / DETECTING state
    if (uploadStatus === "reading" || uploadStatus === "detecting") {
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
                {uploadStatus === "reading" ? "Membaca file..." : "Mendeteksi jenis data..."}
              </p>
              <p className="text-[11px] text-[#5c5c5c]">{uploadFileName}</p>
            </div>
          </div>
        </div>
      );
    }

    // IDLE state — drop zone
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200
          ${isDragOver
            ? "border-[#171717] bg-[#171717]/5 scale-[1.01]"
            : "border-[#d5d5d5] bg-white hover:border-[#171717]/50 hover:bg-[#fafafa]"
          }`}
      >
        <label className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200
                ${isDragOver ? "bg-[#171717] text-white scale-110" : "bg-[#f3f3f3] text-[#5c5c5c]"}`}
            >
              <Upload className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#171717]">
                {isDragOver ? "Lepaskan file di sini" : "Seret file ke sini atau klik untuk memilih"}
              </p>
              <p className="mt-1 text-xs text-[#5c5c5c]">
                Sistem akan <span className="font-semibold text-[#171717]">otomatis mendeteksi</span> jenis data dari struktur kolom
              </p>
              <p className="mt-0.5 text-[11px] text-[#9c9c9c]">
                Mendukung .xlsx, .xls, .csv — maks. 10 MB
              </p>
            </div>

            {/* Supported types hint */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {(
                [
                  { label: "Pelanggan", color: "bg-blue-50 text-blue-600 border-blue-200" },
                  { label: "Instansi", color: "bg-purple-50 text-purple-600 border-purple-200" },
                  { label: "Penjualan", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                  { label: "Seller", color: "bg-amber-50 text-amber-600 border-amber-200" },
                  { label: "Wilayah", color: "bg-rose-50 text-rose-600 border-rose-200" },
                ] as const
              ).map((t) => (
                <span
                  key={t.label}
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${t.color}`}
                >
                  {t.label}
                </span>
              ))}
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

  // ─── JSX ───────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Pusat Laporan &amp; Rekapitulasi
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Upload data, unduh laporan, dan kompilasi operasional format Excel secara instan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-xs text-[#171717]">
              <Calendar className="h-3.5 w-3.5 text-[#5c5c5c]" />
              <span className="font-semibold">{period}</span>
            </div>

            <Button
              onClick={handleExportCurrentReport}
              className="rounded-xl bg-[#171717] hover:bg-[#171717]/85 text-white font-semibold text-xs shadow-sm h-10 px-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Download className="mr-2 h-4 w-4 text-[#d51100]" />
              Export Laporan Terpilih (.xlsx)
            </Button>
          </div>
        </div>

        {/* =========================================================
            SECTION: SINGLE UPLOAD AREA
        ========================================================= */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#171717]">
              <Upload className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171717]">Upload Data</h2>
              <p className="text-[11px] text-[#5c5c5c]">
                Upload satu file — sistem akan mendeteksi jenis data secara otomatis dari struktur kolom
              </p>
            </div>
          </div>

          {renderUploadArea()}
        </div>

        {/* =========================================================
            DIVIDER
        ========================================================= */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e5e5e5]" />
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5c5c5c]">
            <FileText className="h-3.5 w-3.5" />
            Preview &amp; Export Laporan
          </span>
          <div className="h-px flex-1 bg-[#e5e5e5]" />
        </div>

        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <TabsList className="bg-white border border-[#e5e5e5] p-1.5 rounded-2xl inline-flex shadow-sm gap-1">
              <TabsTrigger
                value="penjualan"
                className="gap-2 rounded-xl text-xs py-2 px-3.5 data-[state=active]:bg-[#171717] data-[state=active]:text-white transition-all duration-200 hover:-translate-y-0.5"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Laporan Penjualan
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="gap-2 rounded-xl text-xs py-2 px-3.5 data-[state=active]:bg-[#171717] data-[state=active]:text-white transition-all duration-200 hover:-translate-y-0.5"
              >
                <DollarSign className="h-3.5 w-3.5" />
                Laporan Revenue
              </TabsTrigger>
              <TabsTrigger
                value="pelanggan"
                className="gap-2 rounded-xl text-xs py-2 px-3.5 data-[state=active]:bg-[#171717] data-[state=active]:text-white transition-all duration-200 hover:-translate-y-0.5"
              >
                <Users className="h-3.5 w-3.5" />
                Laporan Pelanggan
              </TabsTrigger>
              <TabsTrigger
                value="seller"
                className="gap-2 rounded-xl text-xs py-2 px-3.5 data-[state=active]:bg-[#171717] data-[state=active]:text-white transition-all duration-200 hover:-translate-y-0.5"
              >
                <Briefcase className="h-3.5 w-3.5" />
                Laporan Seller
              </TabsTrigger>
              <TabsTrigger
                value="wilayah"
                className="gap-2 rounded-xl text-xs py-2 px-3.5 data-[state=active]:bg-[#171717] data-[state=active]:text-white transition-all duration-200 hover:-translate-y-0.5"
              >
                <MapPin className="h-3.5 w-3.5" />
                Laporan Wilayah
              </TabsTrigger>
            </TabsList>
          </div>

          {/* =========================================================
              TAB 1: LAPORAN PENJUALAN
          ========================================================= */}
          <TabsContent value="penjualan" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Total Transaksi", value: "1.250 Unit", sub: "+12,4% tren", subColor: "text-emerald-700 font-semibold" },
                { label: "Transaksi Berhasil", value: "1.182 Sukses", sub: "Tingkat keberhasilan 94,5%", subColor: "text-[#5c5c5c]" },
                { label: "Total Nominal", value: "Rp 845.200.000", sub: "Bulan berjalan", subColor: "text-[#5c5c5c]", valueColor: "text-[#d51100]" },
              ].map((card, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#e5e5e5] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(23,23,23,0.10)] hover:border-[#d1d1d1] cursor-default"
                >
                  <span className="text-xs text-[#5c5c5c]">{card.label}</span>
                  <p className={`mt-1 text-2xl font-bold ${card.valueColor ?? "text-[#171717]"}`}>{card.value}</p>
                  <span className={`text-[11px] ${card.subColor}`}>{card.sub}</span>
                </div>
              ))}
            </div>

            <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#171717]">Preview Data Laporan Penjualan</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-4 py-3">Pelanggan</th>
                        <th className="px-4 py-3">Paket</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-5 py-3">Seller</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {transactionsData.map((trx) => (
                        <tr key={trx.id} className="hover:bg-[#f5f5f5] transition-colors duration-150">
                          <td className="px-5 py-3 font-mono text-xs font-semibold">{trx.id}</td>
                          <td className="px-4 py-3 text-xs font-medium">{trx.customerName}</td>
                          <td className="px-4 py-3 text-xs">{trx.packageName}</td>
                          <td className="px-4 py-3 text-xs text-[#5c5c5c]">{trx.date}</td>
                          <td className="px-4 py-3 text-right font-semibold text-xs">{formatRupiah(trx.amount)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-md bg-[#f3f3f3] px-2 py-0.5 text-xs font-medium">{trx.status}</span>
                          </td>
                          <td className="px-5 py-3 text-xs text-[#5c5c5c]">{trx.sellerName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* =========================================================
              TAB 2: LAPORAN REVENUE
          ========================================================= */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Gross Revenue", value: "Rp 845,2 Jt", sub: "+8,7% vs bulan lalu", subColor: "text-emerald-700 font-semibold" },
                { label: "Rata-rata Harian", value: "Rp 49,7 Jt", sub: "17 hari tercatat", subColor: "text-[#5c5c5c]" },
                { label: "Estimasi Akhir Bulan", value: "Rp 1,49 M", sub: "Target tercapai 104%", subColor: "text-[#5c5c5c]", valueColor: "text-[#d51100]" },
              ].map((card, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#e5e5e5] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(23,23,23,0.10)] hover:border-[#d1d1d1] cursor-default"
                >
                  <span className="text-xs text-[#5c5c5c]">{card.label}</span>
                  <p className={`mt-1 text-2xl font-bold ${card.valueColor ?? "text-[#171717]"}`}>{card.value}</p>
                  <span className={`text-[11px] ${card.subColor}`}>{card.sub}</span>
                </div>
              ))}
            </div>

            <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#171717]">Preview Rekapitulasi Revenue Harian</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                        <th className="px-5 py-3">Tanggal</th>
                        <th className="px-4 py-3 text-center">Unit Terjual</th>
                        <th className="px-4 py-3 text-right">Revenue (Rp)</th>
                        <th className="px-5 py-3 text-center">Occupancy (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {dailyAnalyticsData.map((d) => (
                        <tr key={d.date} className="hover:bg-[#f5f5f5] transition-colors duration-150">
                          <td className="px-5 py-3 text-xs font-medium">{d.date}</td>
                          <td className="px-4 py-3 text-center text-xs font-bold">{d.penjualan} unit</td>
                          <td className="px-4 py-3 text-right font-semibold text-xs text-[#d51100]">{formatRupiah(d.revenue)}</td>
                          <td className="px-5 py-3 text-center text-xs font-medium text-[#171717]">{d.occupancy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* =========================================================
              TAB 3: LAPORAN PELANGGAN
          ========================================================= */}
          <TabsContent value="pelanggan" className="space-y-4">
            <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#171717]">Preview Database Pelanggan Terdaftar</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-4 py-3">Nama Pelanggan</th>
                        <th className="px-4 py-3">Wilayah</th>
                        <th className="px-4 py-3">Paket</th>
                        <th className="px-4 py-3 text-right">Biaya Bulanan</th>
                        <th className="px-5 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {customersData.map((c) => (
                        <tr key={c.id} className="hover:bg-[#f5f5f5] transition-colors duration-150">
                          <td className="px-5 py-3 font-mono text-xs font-semibold">{c.id}</td>
                          <td className="px-4 py-3 text-xs font-medium">{c.name}</td>
                          <td className="px-4 py-3 text-xs text-[#5c5c5c]">{c.kecamatan}</td>
                          <td className="px-4 py-3 text-xs">{c.package} ({c.speed})</td>
                          <td className="px-4 py-3 text-right font-semibold text-xs">{formatRupiah(c.monthlyFee)}</td>
                          <td className="px-5 py-3 text-center">
                            <Badge variant={c.status === "Aktif" ? "success" : "secondary"}>{c.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* =========================================================
              TAB 4: LAPORAN SELLER
          ========================================================= */}
          <TabsContent value="seller" className="space-y-4">
            <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#171717]">Preview Performa Penjualan Seluruh Seller</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                        <th className="px-5 py-3 text-center">Rank</th>
                        <th className="px-4 py-3">Nama Seller</th>
                        <th className="px-4 py-3">Wilayah Tugas</th>
                        <th className="px-4 py-3 text-center">Realisasi / Target</th>
                        <th className="px-4 py-3 text-right">Revenue</th>
                        <th className="px-5 py-3 text-center">Pencapaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {sellerData.map((s) => (
                        <tr key={s.id} className="hover:bg-[#f5f5f5] transition-colors duration-150">
                          <td className="px-5 py-3 text-center font-bold text-xs">#{s.rank}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-[#171717]">{s.name}</td>
                          <td className="px-4 py-3 text-xs text-[#5c5c5c]">{s.region}</td>
                          <td className="px-4 py-3 text-center text-xs">
                            <span className="font-bold">{s.penjualan}</span> / {s.target} unit
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-xs">{formatRupiah(s.revenue)}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-xs font-bold ${s.progress >= 100 ? "text-[#d51100]" : "text-[#171717]"}`}>
                              {s.progress.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* =========================================================
              TAB 5: LAPORAN WILAYAH
          ========================================================= */}
          <TabsContent value="wilayah" className="space-y-4">
            <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#171717]">Preview Data Cakupan Wilayah Kabupaten Lumajang</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                        <th className="px-5 py-3">Kecamatan</th>
                        <th className="px-4 py-3 text-center">Target</th>
                        <th className="px-4 py-3 text-center">Realisasi</th>
                        <th className="px-4 py-3 text-right">Total Revenue</th>
                        <th className="px-4 py-3 text-center">Pelanggan</th>
                        <th className="px-5 py-3 text-center">Penetrasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {wilayahData.map((w) => (
                        <tr key={w.id} className="hover:bg-[#f5f5f5] transition-colors duration-150">
                          <td className="px-5 py-3 text-xs font-semibold text-[#171717]">{w.kecamatan}</td>
                          <td className="px-4 py-3 text-center text-xs">{w.target} Unit</td>
                          <td className="px-4 py-3 text-center text-xs font-bold">{w.penjualan} Unit</td>
                          <td className="px-4 py-3 text-right font-semibold text-xs">{formatRupiah(w.revenue)}</td>
                          <td className="px-4 py-3 text-center text-xs font-medium">{w.pelanggan.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-3 text-center text-xs font-bold text-[#d51100]">{w.penetrasi.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

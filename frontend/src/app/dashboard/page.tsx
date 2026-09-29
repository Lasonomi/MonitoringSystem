"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ChartNoAxesCombined,
  CircleAlert,
  CircleDollarSign,
  Gauge,
  ShoppingCart,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Linechart } from "@/components/dashboard/linechart";
import { Revenuechart } from "@/components/dashboard/revenuechart";
import { SellerSummary } from "@/components/dashboard/seller-summary";
import { WilayahSummary } from "@/components/dashboard/wilayah-summary";
import { HeatmapPreview } from "@/components/dashboard/heatmap-preview";
import { fetchStats, fetchMeta, type StatsResponse, type MetaResponse } from "@/lib/api";

export default function DashboardPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        fetchStats({
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
        fetchMeta(),
      ]);
      setStats(s);
      setMeta(m);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── KPI computation ───────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    if (!stats) {
      return {
        totalPenjualan: 0,
        totalPelanggan: 0,
        pelangganNunggak: 0,
        occupancy: 0,
        c3mr: 0,
        topCity: "-",
      };
    }

    const total = stats.total_orders;
    const byStatus = stats.by_status ?? {};

    // Count "selesai/sukses"
    const selesai = Object.entries(byStatus)
      .filter(([k]) => {
        const kl = k.toLowerCase();
        return (
          kl.includes("sukses") ||
          kl.includes("selesai") ||
          kl.includes("done") ||
          kl.includes("complete") ||
          kl.includes("success") ||
          kl.includes("ok")
        );
      })
      .reduce((s, [, v]) => s + v, 0);

    // Unique customers (approximation = total orders dari data)
    const totalPelanggan = total;

    // Orders yang belum selesai → "nunggak" approximation
    const pelangganNunggak = total - selesai;

    // C3MR: customer completion rate
    const c3mr = total > 0 ? (selesai / total) * 100 : 0;

    // Occupancy placeholder (tidak ada data jaringan di Excel ini)
    const occupancy = 0;

    const topCity = stats.by_city?.[0]?.city_name ?? "-";

    return { totalPenjualan: total, totalPelanggan, pelangganNunggak, occupancy, c3mr, topCity };
  }, [stats]);

  const hasData = meta?.has_data ?? false;

  const resetDate = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Dashboard Overview
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-5 text-[#5c5c5c]">
              Monitoring operasional order dari data Excel yang diupload.
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
              {hasData ? "Data Tersedia" : "Menunggu Upload"}
            </span>
          </div>
        </div>

        {/* No data banner */}
        {!hasData && !loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Belum ada data order</p>
              <p className="text-xs text-amber-700">
                Pergi ke halaman <strong>Laporan &amp; Export</strong> dan upload file Excel
                dengan kolom: ORDER ID, STO, DATEL, TYPE TRANSAKSI, STATUS, ORDER DATE,
                CUST NAME, CUST ADDRESS, CITY NAME, PACKAGE.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            FILTER TANGGAL
        ====================================================== */}
        <section className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#171717]">
                Periode Dashboard
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#5c5c5c]">
                Filter berdasarkan tanggal order. Kosongkan untuk menampilkan semua data.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="min-w-0">
                <label
                  htmlFor="start-date"
                  className="mb-1.5 block text-xs font-medium text-[#5c5c5c]"
                >
                  Tanggal Mulai
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-10 w-full min-w-0 rounded-xl border border-[#e5e5e5] bg-white px-3 text-sm text-[#171717] outline-none transition focus:border-[#d51100] focus:ring-2 focus:ring-[#d51100]/10"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="end-date"
                  className="mb-1.5 block text-xs font-medium text-[#5c5c5c]"
                >
                  Tanggal Sampai
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-10 w-full min-w-0 rounded-xl border border-[#e5e5e5] bg-white px-3 text-sm text-[#171717] outline-none transition focus:border-[#d51100] focus:ring-2 focus:ring-[#d51100]/10"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetDate}
                  className="h-10 w-full rounded-xl bg-[#171717] px-4 text-sm font-medium text-white transition hover:bg-[#d51100] sm:w-auto"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            KPI CARDS
        ====================================================== */}
        <section>
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#5c5c5c]" />
              <span className="ml-2 text-sm text-[#5c5c5c]">Memuat KPI...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {/* Total Order */}
              <StatCard
                title="Total Order"
                value={kpi.totalPenjualan.toLocaleString("id-ID")}
                description="dari data upload"
                icon={ShoppingCart}
              />

              {/* Top Kota */}
              <StatCard
                title="Top Kota"
                value={kpi.topCity}
                description="kota terbanyak"
                icon={CircleDollarSign}
              />

              {/* Total Pelanggan */}
              <StatCard
                title="Total Order (Pelanggan)"
                value={kpi.totalPelanggan.toLocaleString("id-ID")}
                description="total dari data"
                icon={Users}
              />

              {/* Belum Selesai */}
              <StatCard
                title="Belum Selesai"
                value={kpi.pelangganNunggak.toLocaleString("id-ID")}
                description="order belum selesai"
                icon={CircleAlert}
              />

              {/* Occupancy — masih static */}
              <StatCard
                title="Occupancy"
                value="N/A"
                description="tidak ada di data"
                icon={Gauge}
              />

              {/* C3MR */}
              <StatCard
                title="C3MR"
                value={`${kpi.c3mr.toFixed(1)}%`}
                description="completion rate"
                progress={kpi.c3mr}
                icon={ChartNoAxesCombined}
              />
            </div>
          )}
        </section>

        {/* =====================================================
            ANALYTICS — Grafik Penjualan & Distribusi Paket
        ====================================================== */}
        <section>
          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="min-w-0">
              <Linechart data={stats?.by_date || []} loading={loading} />
            </div>
            <div className="min-w-0">
              <Revenuechart data={stats?.by_package || []} loading={loading} />
            </div>
          </div>
        </section>

        {/* =====================================================
            DISTRIBUSI STO & WILAYAH KOTA
        ====================================================== */}
        <section>
          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="min-w-0">
              <SellerSummary data={stats?.by_sto || []} totalOrders={stats?.total_orders || 0} />
            </div>
            <div className="min-w-0">
              <WilayahSummary data={stats?.by_city || []} totalOrders={stats?.total_orders || 0} />
            </div>
          </div>
        </section>

        {/* =====================================================
            HEATMAP
        ====================================================== */}
        <section className="min-w-0">
          <HeatmapPreview />
        </section>
      </div>
    </DashboardLayout>
  );
}
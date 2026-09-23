"use client";

import { useMemo, useState } from "react";
import {
  ChartNoAxesCombined,
  CircleAlert,
  CircleDollarSign,
  Gauge,
  ShoppingCart,
  Users,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Linechart } from "@/components/dashboard/linechart";
import { Revenuechart } from "@/components/dashboard/revenuechart";
import { SellerSummary } from "@/components/dashboard/seller-summary";
import { WilayahSummary } from "@/components/dashboard/wilayah-summary";
import { HeatmapPreview } from "@/components/dashboard/heatmap-preview";
import { dashboardKpi } from "@/lib/dummy-data";

export default function DashboardPage() {
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-23");

  /*
   * ==========================================================
   * DUMMY FILTER
   * Nanti bagian ini diganti dengan API Laravel.
   * ==========================================================
   */

  const filteredKpi = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference = end.getTime() - start.getTime();

    const days = Math.max(
      Math.floor(difference / (1000 * 60 * 60 * 24)) + 1,
      1,
    );

    const periodFactor = Math.min(days / 30, 1);

    const totalPelanggan = 3420;
    const basePenjualan = 1250;
    const baseRevenue = 845200000;
    const baseNunggak = 186;

    const totalPenjualan = Math.round(
      basePenjualan * periodFactor,
    );

    const totalRevenue = Math.round(
      baseRevenue * periodFactor,
    );

    const pelangganNunggak = Math.round(
      baseNunggak * (0.85 + periodFactor * 0.15),
    );

    const occupancy = Math.min(
      100,
      70 + periodFactor * 8.4,
    );

    const c3mr =
      ((totalPelanggan - pelangganNunggak) /
        totalPelanggan) *
      100;

    return {
      totalPenjualan,
      totalRevenue,
      totalPelanggan,
      pelangganNunggak,
      occupancy,
      c3mr,
    };
  }, [startDate, endDate]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const resetDate = () => {
    setStartDate("2026-09-01");
    setEndDate("2026-09-23");
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
              Monitoring operasional penjualan, pendapatan,
              pelanggan, dan jaringan Kabupaten Lumajang.
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
              Sistem Normal & Online
            </span>
          </div>
        </div>

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
                Filter berlaku untuk penjualan, revenue,
                pelanggan nunggak, occupancy, dan C3MR.
                Total pelanggan tidak berubah.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
              {/* Start date */}
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
                  max={endDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  className="h-10 w-full min-w-0 rounded-xl border border-[#e5e5e5] bg-white px-3 text-sm text-[#171717] outline-none transition focus:border-[#d51100] focus:ring-2 focus:ring-[#d51100]/10"
                />
              </div>

              {/* End date */}
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
                  min={startDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  className="h-10 w-full min-w-0 rounded-xl border border-[#e5e5e5] bg-white px-3 text-sm text-[#171717] outline-none transition focus:border-[#d51100] focus:ring-2 focus:ring-[#d51100]/10"
                />
              </div>

              {/* Reset */}
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
            Desktop besar = 6 card satu baris
            Desktop = 3 x 2
            Mobile = horizontal scroll
        ====================================================== */}
        <section>
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              2xl:grid-cols-6
            "
          >
            {/* Total Penjualan */}
            <StatCard
              title="Total Penjualan"
              value={filteredKpi.totalPenjualan.toLocaleString(
                "id-ID",
              )}
              description="Periode terpilih"
              trend={dashboardKpi.totalPenjualan.trend}
              trendType={
                dashboardKpi.totalPenjualan.trendType
              }
              icon={ShoppingCart}
            />

            {/* Total Revenue */}
            <StatCard
              title="Total Revenue"
              value={formatRupiah(
                filteredKpi.totalRevenue,
              )}
              description="Periode terpilih"
              trend={dashboardKpi.totalRevenue.trend}
              trendType={
                dashboardKpi.totalRevenue.trendType
              }
              icon={CircleDollarSign}
            />

            {/* Total Pelanggan */}
            <StatCard
              title="Total Pelanggan"
              value={filteredKpi.totalPelanggan.toLocaleString(
                "id-ID",
              )}
              description="Total seluruh pelanggan"
              icon={Users}
            />

            {/* Pelanggan Nunggak */}
            <StatCard
              title="Pelanggan Nunggak"
              value={filteredKpi.pelangganNunggak.toLocaleString(
                "id-ID",
              )}
              description="Periode terpilih"
              trend="-4,2%"
              trendType="down"
              icon={CircleAlert}
            />

            {/* Occupancy */}
            <StatCard
              title="Occupancy"
              value={`${filteredKpi.occupancy.toFixed(1)}%`}
              description="Periode terpilih"
              progress={filteredKpi.occupancy}
              icon={Gauge}
            />

            {/* C3MR */}
            <StatCard
              title="C3MR"
              value={`${filteredKpi.c3mr.toFixed(1)}%`}
              description="Periode terpilih"
              progress={filteredKpi.c3mr}
              icon={ChartNoAxesCombined}
            />
          </div>
        </section>

        {/* =====================================================
            ANALYTICS
        ====================================================== */}
        <section>
          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="min-w-0">
              <Linechart />
            </div>

            <div className="min-w-0">
              <Revenuechart />
            </div>
          </div>
        </section>

        {/* =====================================================
            SELLER + WILAYAH
        ====================================================== */}
        <section>
          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="min-w-0">
              <SellerSummary />
            </div>

            <div className="min-w-0">
              <WilayahSummary />
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
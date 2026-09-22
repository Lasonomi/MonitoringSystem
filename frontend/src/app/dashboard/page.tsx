import {
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Gauge,
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
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* =========================================================
            1. PAGE TITLE & WELCOME
        ========================================================= */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Dashboard Overview
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Monitoring operasional penjualan, pendapatan, pelanggan, dan jaringan Kabupaten Lumajang
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Sistem Normal & Online
            </span>
          </div>
        </div>

        {/* =========================================================
            2. KPI CARDS (5 METRICS)
        ========================================================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Total Penjualan */}
          <StatCard
            title={dashboardKpi.totalPenjualan.title}
            value={dashboardKpi.totalPenjualan.value}
            trend={dashboardKpi.totalPenjualan.trend}
            trendType={dashboardKpi.totalPenjualan.trendType}
            description={dashboardKpi.totalPenjualan.description}
            icon={TrendingUp}
          />

          {/* Total Revenue */}
          <StatCard
            title={dashboardKpi.totalRevenue.title}
            value={dashboardKpi.totalRevenue.value}
            trend={dashboardKpi.totalRevenue.trend}
            trendType={dashboardKpi.totalRevenue.trendType}
            description={dashboardKpi.totalRevenue.description}
            icon={DollarSign}
          />

          {/* Total Pelanggan */}
          <StatCard
            title={dashboardKpi.totalPelanggan.title}
            value={dashboardKpi.totalPelanggan.value}
            trend={dashboardKpi.totalPelanggan.trend}
            trendType={dashboardKpi.totalPelanggan.trendType}
            description={dashboardKpi.totalPelanggan.description}
            icon={Users}
          />

          {/* Total Instansi */}
          <StatCard
            title={dashboardKpi.totalInstansi.title}
            value={dashboardKpi.totalInstansi.value}
            trend={dashboardKpi.totalInstansi.trend}
            trendType={dashboardKpi.totalInstansi.trendType}
            description={dashboardKpi.totalInstansi.description}
            icon={Building2}
          />

          {/* Occupancy Jaringan */}
          <StatCard
            title={dashboardKpi.occupancy.title}
            value={dashboardKpi.occupancy.value}
            description={dashboardKpi.occupancy.description}
            progress={dashboardKpi.occupancy.percentage}
            icon={Gauge}
          />
        </div>

        {/* =========================================================
            3. ANALYTICS: DUA CHART BERDAMPINGAN
        ========================================================= */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Linechart />
          <Revenuechart />
        </div>

        {/* =========================================================
            4 & 5. SELLER & WILAYAH SUMMARY BERDAMPINGAN
        ========================================================= */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SellerSummary />
          <WilayahSummary />
        </div>

        {/* =========================================================
            6. HEATMAP PREVIEW
        ========================================================= */}
        <div>
          <HeatmapPreview />
        </div>
      </div>
    </DashboardLayout>
  );
}
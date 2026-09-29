"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";

interface RevenuechartProps {
  data?: { package: string; count: number }[];
  loading?: boolean;
}

export function Revenuechart({ data = [], loading = false }: RevenuechartProps) {
  const chartData = useMemo(() => {
    return (data || []).slice(0, 7).map((item) => ({
      package: item.package || "Tanpa Paket",
      count: item.count,
    }));
  }, [data]);

  const totalPackageOrders = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-[#171717]">
                Distribusi Paket Layanan
              </CardTitle>
              <span className="rounded-md bg-[#d51100]/10 text-[#d51100] px-2 py-0.5 text-xs font-semibold">
                {totalPackageOrders} Order
              </span>
            </div>
            <p className="mt-1 text-xs text-[#5c5c5c]">
              Volume order per jenis paket layanan (data riil Excel)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#5c5c5c]" />
              <span className="ml-2 text-xs text-[#5c5c5c]">Memuat data paket...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#5c5c5c]">
              <Package className="h-8 w-8 text-[#a3a3a3]" />
              <p className="text-xs font-medium">Belum ada data paket layanan.</p>
              <p className="text-[11px] text-[#737373]">
                Upload file Excel di menu Laporan untuk menampilkan grafik riil.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="package"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#5c5c5c" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#5c5c5c" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e5e5e5",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${value ?? 0} Order`, "Total Order"]}
                />
                <Bar
                  dataKey="count"
                  name="Total Order"
                  fill="#171717"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

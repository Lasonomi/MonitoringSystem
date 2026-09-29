"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

interface LinechartProps {
  data?: { date: string; count: number }[];
  loading?: boolean;
}

export function Linechart({ data = [], loading = false }: LinechartProps) {
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      date: item.date,
      penjualan: item.count,
    }));
  }, [data]);

  const totalPenjualanPeriod = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.penjualan, 0);
  }, [chartData]);

  return (
    <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-[#171717]">
                Grafik Penjualan Unit
              </CardTitle>
              <span className="rounded-md bg-[#171717] px-2 py-0.5 text-xs font-semibold text-white">
                {totalPenjualanPeriod} Order
              </span>
            </div>
            <p className="mt-1 text-xs text-[#5c5c5c]">
              Tren volume order per tanggal (data riil database)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#5c5c5c]" />
              <span className="ml-2 text-xs text-[#5c5c5c]">Memuat data grafik...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#5c5c5c]">
              <p className="text-xs font-medium">Belum ada data grafik penjualan.</p>
              <p className="text-[11px] text-[#737373]">
                Upload file Excel di menu Laporan untuk menampilkan grafik riil.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#5c5c5c" }}
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
                  labelFormatter={(value) => `Tanggal: ${value}`}
                  formatter={(value: any) => [`${value ?? 0} Order`, "Penjualan"]}
                />
                <Line
                  type="monotone"
                  dataKey="penjualan"
                  name="Penjualan"
                  stroke="#171717"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#171717" }}
                  activeDot={{ r: 6, fill: "#d51100", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dailyAnalyticsData, formatRupiah, formatShortRupiah } from "@/lib/dummy-data";
import { Calendar, DollarSign } from "lucide-react";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

export function Revenuechart() {
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-17");

  const filteredData = useMemo(() => {
    return dailyAnalyticsData.filter(
      (item) => item.date >= startDate && item.date <= endDate
    );
  }, [startDate, endDate]);

  const totalRevenuePeriod = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [filteredData]);

  return (
    <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-[#171717]">
                Grafik Revenue
              </CardTitle>
              <span className="rounded-md bg-[#d51100]/10 text-[#d51100] px-2 py-0.5 text-xs font-semibold">
                {formatShortRupiah(totalRevenuePeriod)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#5c5c5c]">
              Akumulasi pendapatan harian dalam periode terpilih
            </p>
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1.5 text-[#5c5c5c]">
              <Calendar className="h-3.5 w-3.5 text-[#171717]" />
              <label htmlFor="rev-start-date" className="font-medium text-[#171717]">
                Dari:
              </label>
              <input
                id="rev-start-date"
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-[#171717] outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1.5 text-[#5c5c5c]">
              <label htmlFor="rev-end-date" className="font-medium text-[#171717]">
                Sampai:
              </label>
              <input
                id="rev-end-date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-[#171717] outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d51100" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d51100" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#5c5c5c" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatShortRupiah(val)}
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
                formatter={(value: any) => [formatRupiah(Number(value)), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#d51100"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {filteredData.length === 0 && (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-xs text-[#5c5c5c]">
              Tidak ada data revenue pada rentang tanggal tersebut.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

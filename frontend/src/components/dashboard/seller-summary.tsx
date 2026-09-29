"use client";

import Link from "next/link";
import { ArrowUpRight, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SellerSummaryProps {
  data?: { sto: string; count: number }[];
  totalOrders?: number;
}

export function SellerSummary({ data = [], totalOrders = 0 }: SellerSummaryProps) {
  const topSto = (data || []).slice(0, 5);

  return (
    <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#171717] text-white">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-[#171717]">
              Top STO / Area
            </CardTitle>
            <p className="text-xs text-[#5c5c5c]">
              Distribusi volume order per STO (Sentral Telepon Otomat)
            </p>
          </div>
        </div>

        <Link href="/penjualan">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#e5e5e5] text-xs font-semibold text-[#171717] hover:bg-[#f3f3f3]"
          >
            Lihat Detail
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-2">
        {topSto.length === 0 ? (
          <div className="flex h-44 flex-col items-center justify-center text-xs text-[#5c5c5c]">
            <Network className="mb-2 h-7 w-7 text-[#a3a3a3]" />
            <p className="font-medium">Belum ada data STO</p>
            <p className="text-[11px] text-[#737373]">Upload file Excel untuk melihat persebaran STO.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-xs font-semibold text-[#5c5c5c]">
                  <th className="pb-3 pr-4">Kode STO</th>
                  <th className="pb-3 pr-4 text-center">Total Order</th>
                  <th className="pb-3 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {topSto.map((item, idx) => {
                  const pct = totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(1) : "0";
                  return (
                    <tr key={idx} className="group hover:bg-[#f9f9f9] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f3f3] text-[#171717] group-hover:bg-[#d51100]/10 group-hover:text-[#d51100] transition-colors text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-[#171717] group-hover:text-[#d51100] transition-colors text-xs">
                              {item.sto || "Lainnya"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-center font-medium text-[#171717] text-xs">
                        {item.count} Order
                      </td>
                      <td className="py-3 text-right text-xs font-semibold text-[#171717]">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

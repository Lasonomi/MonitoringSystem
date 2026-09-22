"use client";

import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { sellerData, formatShortRupiah } from "@/lib/dummy-data";

export function SellerSummary() {
  const topSellers = sellerData.slice(0, 5);

  return (
    <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#171717] text-white">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-[#171717]">
              Top Performa Seller
            </CardTitle>
            <p className="text-xs text-[#5c5c5c]">
              Pencapaian penjualan & target tim marketing
            </p>
          </div>
        </div>

        <Link href="/seller">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#e5e5e5] text-xs font-semibold text-[#171717] hover:bg-[#f3f3f3]"
          >
            Lihat Semua Seller
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] text-xs font-semibold text-[#5c5c5c]">
                <th className="pb-3 pr-4">Seller</th>
                <th className="pb-3 pr-4 text-center">Penjualan</th>
                <th className="pb-3 pr-4 text-right">Revenue</th>
                <th className="pb-3 pr-4 text-center">Target</th>
                <th className="pb-3 min-w-[130px]">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {topSellers.map((seller) => (
                <tr key={seller.id} className="group hover:bg-[#f9f9f9] transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-lg border border-[#e5e5e5]">
                        <AvatarFallback className="bg-[#f3f3f3] text-xs font-bold text-[#171717]">
                          {seller.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-xs text-[#171717] group-hover:text-[#d51100] transition-colors">
                          {seller.name}
                        </p>
                        <p className="text-[11px] text-[#5c5c5c]">{seller.region}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-4 text-center">
                    <span className="font-semibold text-xs text-[#171717]">
                      {seller.penjualan}
                    </span>
                    <span className="text-[10px] text-[#5c5c5c] ml-0.5">unit</span>
                  </td>

                  <td className="py-3 pr-4 text-right">
                    <span className="font-semibold text-xs text-[#171717]">
                      {formatShortRupiah(seller.revenue)}
                    </span>
                  </td>

                  <td className="py-3 pr-4 text-center">
                    <span className="text-xs text-[#5c5c5c]">
                      {seller.target} unit
                    </span>
                  </td>

                  <td className="py-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={
                            seller.progress >= 100
                              ? "font-bold text-[#d51100]"
                              : "font-semibold text-[#171717]"
                          }
                        >
                          {seller.progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(seller.progress, 100)}
                        className="h-1.5"
                        indicatorClassName={
                          seller.progress >= 100 ? "bg-[#d51100]" : "bg-[#171717]"
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

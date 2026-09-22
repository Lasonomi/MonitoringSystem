"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { wilayahData, formatShortRupiah } from "@/lib/dummy-data";

export function WilayahSummary() {
  const topWilayah = wilayahData.slice(0, 5);

  return (
    <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#171717] text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-[#171717]">
              Cakupan Wilayah & Penetrasi
            </CardTitle>
            <p className="text-xs text-[#5c5c5c]">
              Wilayah dengan volume transaksi & pengguna tertinggi
            </p>
          </div>
        </div>

        <Link href="/wilayah">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#e5e5e5] text-xs font-semibold text-[#171717] hover:bg-[#f3f3f3]"
          >
            Lihat Semua Wilayah
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] text-xs font-semibold text-[#5c5c5c]">
                <th className="pb-3 pr-4">Wilayah / Kecamatan</th>
                <th className="pb-3 pr-4 text-center">Penjualan</th>
                <th className="pb-3 pr-4 text-right">Revenue</th>
                <th className="pb-3 text-center">Pelanggan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {topWilayah.map((item) => (
                <tr key={item.id} className="group hover:bg-[#f9f9f9] transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f3f3] text-[#171717] group-hover:bg-[#d51100]/10 group-hover:text-[#d51100] transition-colors">
                        <MapPin className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-[#171717]">
                          {item.kecamatan}
                        </p>
                        <p className="text-[11px] text-[#5c5c5c]">Kab. Lumajang</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-4 text-center">
                    <span className="font-semibold text-xs text-[#171717]">
                      {item.penjualan}
                    </span>
                    <span className="text-[10px] text-[#5c5c5c] ml-0.5">unit</span>
                  </td>

                  <td className="py-3 pr-4 text-right">
                    <span className="font-semibold text-xs text-[#171717]">
                      {formatShortRupiah(item.revenue)}
                    </span>
                  </td>

                  <td className="py-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-[#f3f3f3] px-2.5 py-0.5 text-xs font-semibold text-[#171717]">
                      {item.pelanggan.toLocaleString("id-ID")}
                    </span>
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

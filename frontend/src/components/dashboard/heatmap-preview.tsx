"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const HeatmapPreview = dynamic(
  () =>
    import("./heatmap-preview-client").then((mod) => mod.HeatmapPreviewClient),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Memuat heatmap aktivitas"
        className="w-full rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-[0_4px_20px_rgba(23,23,23,0.05)]"
      >
        <span className="sr-only">Memuat heatmap aktivitas...</span>
        <Skeleton className="mb-5 h-5 w-48" />
        <div className="grid h-[380px] grid-cols-7 gap-2 rounded-xl bg-[#fafafa] p-3 sm:grid-cols-10">
          {Array.from({ length: 70 }, (_, index) => (
            <Skeleton key={index} className="rounded-md" />
          ))}
        </div>
      </div>
    ),
  }
);

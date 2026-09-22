"use client";

import dynamic from "next/dynamic";

export const HeatmapPreview = dynamic(
  () =>
    import("./heatmap-preview-client").then((mod) => mod.HeatmapPreviewClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[450px] w-full items-center justify-center rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d51100] border-t-transparent" />
          <p className="text-xs text-[#5c5c5c]">Memuat heatmap aktivitas...</p>
        </div>
      </div>
    ),
  }
);

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-[#e5e5e5]", className)}
      {...props}
    />
  );
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
      <div className="flex items-start justify-between">
        <div className="w-full space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      </div>
      <Skeleton className="mt-5 h-3 w-28" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Memuat grafik"
      className={cn("flex h-full items-end gap-3 px-6 pb-6 pt-8", className)}
    >
      <span className="sr-only">Memuat grafik...</span>
      {["h-1/3", "h-2/3", "h-1/2", "h-4/5", "h-3/5", "h-full", "h-2/5", "h-3/4"].map(
        (height, index) => (
          <Skeleton key={index} className={cn("flex-1 rounded-t-md rounded-b-none", height)} />
        ),
      )}
    </div>
  );
}

export function TableSkeletonRows({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex} aria-hidden="true">
          {Array.from({ length: columns }, (_, columnIndex) => (
            <td key={columnIndex} className="px-4 py-4">
              <Skeleton
                className={cn(
                  "h-3",
                  columnIndex === 0 ? "w-20" : columnIndex % 2 === 0 ? "w-28" : "w-36",
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SummaryRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Memuat ringkasan" className="space-y-4 py-2">
      <span className="sr-only">Memuat ringkasan...</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

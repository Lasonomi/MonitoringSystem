import {
  ArrowDownRight,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down";
  progress?: number;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendType = "up",
  progress,
}: StatCardProps) {
  const TrendIcon = trendType === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="group relative rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(23,23,23,0.13)] hover:border-[#d1d1d1] cursor-default overflow-hidden">
      {/* Subtle glow accent on hover */}
      <span className="pointer-events-none absolute inset-x-0 -top-px h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#d51100]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-[#5c5c5c]">
            {title}
          </CardTitle>

          <div className="mt-2 text-2xl font-bold tracking-tight text-[#171717] transition-colors duration-300 group-hover:text-[#171717]">
            {value}
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f3f3] text-[#171717] transition-all duration-300 group-hover:bg-[#171717] group-hover:text-white group-hover:scale-110 group-hover:rotate-[-6deg]">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent>
        {progress !== undefined ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5c5c5c]">{description}</span>
              <span className="font-bold text-[#d51100]">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-[#f3f3f3]"
              indicatorClassName="bg-[#d51100] transition-all duration-500"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={
                  trendType === "up"
                    ? "flex items-center gap-0.5 rounded-full bg-[#171717] px-2 py-0.5 text-[11px] font-semibold text-white transition-colors duration-300 group-hover:bg-[#d51100]"
                    : "flex items-center gap-0.5 rounded-full bg-[#d51100] px-2 py-0.5 text-[11px] font-semibold text-white"
                }
              >
                <TrendIcon className="h-3 w-3" />
                {trend}
              </span>
            )}

            <span className="text-xs text-[#5c5c5c]">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
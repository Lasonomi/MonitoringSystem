"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  Map,
  FileText,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Penjualan",
    href: "/penjualan",
    icon: TrendingUp,
  },
  {
    label: "Pelanggan",
    href: "/pelanggan",
    icon: Users,
  },
  {
    label: "Instansi",
    href: "/instansi",
    icon: Building2,
  },
  {
    label: "Seller",
    href: "/seller",
    icon: Briefcase,
  },
  {
    label: "Wilayah",
    href: "/wilayah",
    icon: Map,
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: FileText,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Logo & Brand */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-[#e5e5e5]/60">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#171717]">
              Monitoring<span className="text-[#d51100]">System</span>
            </h1>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-[#5c5c5c] hover:bg-[#f3f3f3] md:hidden"
              aria-label="Tutup Menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
            Menu Utama
          </p>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#171717] text-white shadow-sm font-semibold"
                      : "text-[#5c5c5c] hover:bg-[#f3f3f3] hover:text-[#171717]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-[#5c5c5c] group-hover:text-[#d51100]"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d51100]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Settings */}
      <div className="border-t border-[#e5e5e5] p-4 space-y-1">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#5c5c5c] transition hover:bg-[#f3f3f3] hover:text-[#171717]"
        >
          <Settings className="h-4 w-4" />
          <span>Pengaturan</span>
        </button>

        <div className="px-3 pt-2 text-[11px] text-[#5c5c5c]/70">
          v1.0.0 &bull; Lumajang Edition
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar hidden w-64 shrink-0 md:flex flex-col border-r border-[#e5e5e5] bg-white/90 backdrop-blur-md">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer Sheet */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
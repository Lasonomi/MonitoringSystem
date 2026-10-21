"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Briefcase,
  Map,
  FileText,
  Settings,
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
  collapsed?: boolean;
}

export function Sidebar({
  mobileOpen = false,
  onCloseMobile,
  collapsed = false,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (isCollapsed: boolean) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Logo & Brand */}
        <div
          className={cn(
            "flex h-20 items-center border-b border-[#e5e5e5]/60",
            isCollapsed ? "justify-center px-2" : "justify-between px-6"
          )}
        >
          <div className={cn(isCollapsed && "md:hidden")}>
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
        <div className={cn("py-6", isCollapsed ? "px-2" : "px-4")}>
          <p className={cn(
            "mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c]",
            isCollapsed && "md:hidden"
          )}>
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
                  title={isCollapsed ? item.label : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex w-full items-center rounded-xl py-3 text-sm font-medium transition-all duration-200",
                    isCollapsed
                      ? "md:justify-center md:px-2"
                      : "gap-3 px-3.5",
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
                  <span className={cn(isCollapsed && "md:hidden")}>{item.label}</span>
                  {isActive && !isCollapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d51100]" />
                  )}
                  {isActive && isCollapsed && (
                    <span className="absolute right-1 h-1.5 w-1.5 rounded-full bg-[#d51100]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Settings */}
      <div className={cn(
        "space-y-1 border-t border-[#e5e5e5] p-4",
        isCollapsed && "md:px-2"
      )}>
        <button
          type="button"
          title={isCollapsed ? "Pengaturan" : undefined}
          aria-label={isCollapsed ? "Pengaturan" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-[#5c5c5c] transition hover:bg-[#f3f3f3] hover:text-[#171717]",
            isCollapsed
              ? "md:justify-center md:px-2"
              : "gap-3 px-3.5"
          )}
        >
          <Settings className="h-4 w-4" />
          <span className={cn(isCollapsed && "md:hidden")}>Pengaturan</span>
        </button>

        <div className={cn(
          "px-3 pt-2 text-[11px] text-[#5c5c5c]/70",
          isCollapsed && "md:hidden"
        )}>
          v1.0.0 &bull; Lumajang Edition
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "dashboard-sidebar hidden h-dvh shrink-0 flex-col overflow-y-auto border-r border-[#e5e5e5] bg-white/90 backdrop-blur-md transition-[width] duration-200 md:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent(collapsed)}
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
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}
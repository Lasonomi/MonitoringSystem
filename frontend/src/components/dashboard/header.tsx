"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  PanelLeftClose,
  User,
  Settings,
  LogOut,
  Upload,
  Download,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getActivities,
  subscribeToActivities,
  type ActivityEntry,
} from "@/lib/activity-log";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Ringkasan performa penjualan, pelanggan, dan monitoring wilayah",
  },
  "/penjualan": {
    title: "Dashboard Penjualan",
    subtitle: "Monitoring transaksi, volume penjualan produk, dan target revenue",
  },
  "/pelanggan": {
    title: "Data Pelanggan",
    subtitle: "Manajemen data pelanggan terdaftar, status instalasi, dan paket",
  },
  "/seller": {
    title: "Performa Seller",
    subtitle: "Peringkat, pencapaian target, dan evaluasi tim marketing lapangan",
  },
  "/wilayah": {
    title: "Analisis Wilayah",
    subtitle: "Distribusi persebaran pelanggan dan penetrasi pasar per kecamatan",
  },
  "/laporan": {
    title: "Laporan & Export",
    subtitle: "Pusat unduhan dan kompilasi laporan berkala format Excel XLSX",
  },
};

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  title?: string;
  subtitle?: string;
}

export function Header({
  onToggleMobileMenu,
  onToggleSidebar,
  sidebarCollapsed = false,
  title,
  subtitle,
}: HeaderProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityEntry[]>(() => getActivities());

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return subscribeToActivities(() => setActivities(getActivities()));
  }, []);

  const currentInfo = pageTitles[pathname || "/dashboard"] || {
    title: title || "Dashboard Admin",
    subtitle: subtitle || "Sistem Monitoring & Analisis Operasional",
  };

  const displayTitle = title || currentInfo.title;
  const displaySubtitle = subtitle || currentInfo.subtitle;

  return (
    <header className="dashboard-header sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#e5e5e5] bg-white/85 px-3 sm:min-h-20 sm:px-4 md:px-6 xl:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {onToggleMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileMenu}
            className="shrink-0 rounded-xl text-[#171717] hover:bg-[#f3f3f3] md:hidden"
            aria-label="Buka navigasi menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden shrink-0 rounded-xl text-[#171717] hover:bg-[#f3f3f3] md:inline-flex"
            aria-label={sidebarCollapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            aria-expanded={!sidebarCollapsed}
            title={sidebarCollapsed ? "Buka sidebar" : "Ciutkan sidebar"}
          >
            {sidebarCollapsed ? (
              <Image
                src="/logoIndibiz.png"
                alt="IndiBiz"
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-contain"
              />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        )}

        <div className="min-w-0">
          <h2 className="truncate text-base font-bold tracking-tight text-[#171717] sm:text-lg md:text-xl">
            {displayTitle}
          </h2>
          <p className="hidden truncate text-xs text-[#5c5c5c] sm:block">
            {displaySubtitle}
          </p>
        </div>
      </div>

      {/* Right: Notification, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl hover:bg-[#f3f3f3] text-[#171717]"
            aria-label="Lihat Notifikasi"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d51100] ring-2 ring-white animate-pulse" />
          </Button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#e5e5e5] bg-white p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 px-1">
                <p className="font-bold text-xs text-[#171717]">Aktivitas Terbaru</p>
                <span className="text-[10px] font-semibold text-[#d51100] bg-[#d51100]/10 px-1.5 py-0.5 rounded">
                  {activities.length}
                </span>
              </div>
              <div className="mt-2 max-h-80 space-y-2 overflow-y-auto text-xs">
                {activities.length === 0 ? (
                  <p className="px-2 py-4 text-center text-[11px] text-[#5c5c5c]">
                    Belum ada aktivitas upload atau ekspor.
                  </p>
                ) : (
                  activities.map((activity) => {
                    const ActivityIcon = activity.type === "upload" ? Upload : Download;
                    const date = new Date(activity.createdAt);
                    return (
                      <div
                        key={activity.id}
                        className="flex gap-2.5 rounded-xl p-2 hover:bg-[#f5f5f5] transition"
                      >
                        <ActivityIcon
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            activity.type === "upload" ? "text-emerald-600" : "text-[#171717]"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#171717]">
                            {activity.type === "upload" ? "Upload berhasil" : "Ekspor berhasil"}
                          </p>
                          <p className="truncate text-[11px] text-[#5c5c5c]">
                            {activity.fileName}
                          </p>
                          <span className="text-[10px] text-[#5c5c5c]/70">
                            {new Intl.DateTimeFormat("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(date)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-7 w-px bg-[#e5e5e5]" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-[#f3f3f3]"
            aria-label="Menu Profil"
          >
            <Avatar className="h-9 w-9 rounded-xl border border-[#e5e5e5]">
              <AvatarFallback className="bg-[#171717] text-xs font-bold text-white">
                AD
              </AvatarFallback>
            </Avatar>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-[#171717] leading-tight">
                Administrator
              </p>
              <p className="text-[10px] text-[#5c5c5c]">Super Admin</p>
            </div>

            <ChevronDown className="hidden h-3.5 w-3.5 text-[#5c5c5c] sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#e5e5e5] bg-white p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="border-b border-[#e5e5e5] px-3 py-2">
                <p className="text-xs font-bold text-[#171717]">Administrator</p>
                <p className="text-[11px] text-[#5c5c5c]">admin@dashboard.id</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-[#171717] hover:bg-[#f3f3f3]"
                >
                  <User className="h-4 w-4 text-[#5c5c5c]" />
                  <span>Profil Saya</span>
                </button>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-[#171717] hover:bg-[#f3f3f3]"
                >
                  <Settings className="h-4 w-4 text-[#5c5c5c]" />
                  <span>Pengaturan Akun</span>
                </button>
              </div>

              <div className="border-t border-[#e5e5e5] pt-1">
                <button
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#d51100] hover:bg-[#d51100]/10"
                >
                  <LogOut className="h-4 w-4 text-[#d51100]" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
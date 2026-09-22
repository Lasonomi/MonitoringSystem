"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
  "/instansi": {
    title: "Data Instansi & Lembaga",
    subtitle: "Monitoring kemitraan instansi pemerintah, pendidikan, faskes, dan BUMD",
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
  title?: string;
  subtitle?: string;
}

export function Header({ onToggleMobileMenu, title, subtitle }: HeaderProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const currentInfo = pageTitles[pathname || "/dashboard"] || {
    title: title || "Dashboard Admin",
    subtitle: subtitle || "Sistem Monitoring & Analisis Operasional",
  };

  const displayTitle = title || currentInfo.title;
  const displaySubtitle = subtitle || currentInfo.subtitle;

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#e5e5e5] bg-white/85 px-4 md:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileMenu}
            className="md:hidden text-[#171717] hover:bg-[#f3f3f3] rounded-xl"
            aria-label="Buka navigasi menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#171717] md:text-xl">
            {displayTitle}
          </h2>
          <p className="hidden text-xs text-[#5c5c5c] sm:block">
            {displaySubtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Notification, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative hidden w-56 lg:w-64 items-center md:flex">
          <Search className="absolute left-3 h-4 w-4 text-[#5c5c5c]" />
          <input
            type="text"
            placeholder="Cari data, instansi, seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 pl-9 pr-3 text-xs text-[#171717] placeholder:text-[#5c5c5c] outline-none transition focus:border-[#171717] focus:bg-white"
          />
        </div>

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
                <p className="font-bold text-xs text-[#171717]">Notifikasi Sistem</p>
                <span className="text-[10px] font-semibold text-[#d51100] bg-[#d51100]/10 px-1.5 py-0.5 rounded">
                  2 Baru
                </span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex gap-2.5 rounded-xl p-2 bg-[#f5f5f5] hover:bg-[#e5e5e5]/50 transition">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171717]">Instalasi Selesai</p>
                    <p className="text-[11px] text-[#5c5c5c]">
                      Dinas Kominfo Kab. Lumajang 100M aktif
                    </p>
                    <span className="text-[10px] text-[#5c5c5c]/70">10 menit lalu</span>
                  </div>
                </div>

                <div className="flex gap-2.5 rounded-xl p-2 hover:bg-[#f5f5f5] transition">
                  <AlertCircle className="h-4 w-4 text-[#d51100] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171717]">Peringatan Kapasitas</p>
                    <p className="text-[11px] text-[#5c5c5c]">
                      Node Sukodono mendekati occupancy 82%
                    </p>
                    <span className="text-[10px] text-[#5c5c5c]/70">1 jam lalu</span>
                  </div>
                </div>
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
"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import Waves from "@/components/Waves";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#f5f5f5] text-[#171717] antialiased">
      {/* Decorative Waves Background - Rendered once behind all content */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.11]">
        <Waves
          lineColor="#5c5c5c"
          backgroundColor="transparent"
          waveSpeedX={0.0125}
          waveSpeedY={0.008}
          waveAmpX={36}
          waveAmpY={18}
          friction={0.92}
          tension={0.008}
          maxCursorMove={100}
          xGap={12}
          yGap={34}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

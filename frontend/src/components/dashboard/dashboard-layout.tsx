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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="relative h-dvh overflow-hidden bg-[#f5f5f5] text-[#171717] antialiased">
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

      <div className="relative z-10 flex h-full min-h-0">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          collapsed={sidebarCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Header
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
            onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6 xl:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

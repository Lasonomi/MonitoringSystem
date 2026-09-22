"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Network,
  GraduationCap,
  Landmark,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { institutionsData, Institution } from "@/lib/dummy-data";
import { exportToExcel } from "@/lib/excel";

export default function InstansiPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredInstitutions = useMemo(() => {
    return institutionsData.filter((inst) => {
      const matchSearch =
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.picName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.kecamatan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        categoryFilter === "Semua" ? true : inst.category === categoryFilter;

      const matchStatus =
        statusFilter === "Semua" ? true : inst.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInstitutions.slice(start, start + itemsPerPage);
  }, [filteredInstitutions, currentPage]);

  const handleExportExcel = () => {
    const exportData = filteredInstitutions.map((item, idx) => ({
      No: idx + 1,
      "Kode Instansi": item.code,
      "Nama Instansi": item.name,
      Kategori: item.category,
      Wilayah: item.kecamatan,
      "Nama PIC": item.picName,
      "Kontak PIC": item.picPhone,
      "Titik Aktif": item.activePoints,
      "Total Titik": item.totalPoints,
      "Akhir Kontrak": item.contractEnd,
      Status: item.status,
    }));
    exportToExcel(exportData, "Data_Instansi_Lumajang");
  };

  const getStatusBadge = (status: Institution["status"]) => {
    switch (status) {
      case "Aktif":
        return <Badge variant="success">Aktif</Badge>;
      case "Perpanjangan":
        return <Badge variant="warning">Perpanjangan</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              Data Instansi & Lembaga
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Monitoring kemitraan instansi pemerintahan, pendidikan, fasilitas kesehatan, dan korporat
            </p>
          </div>

          <Button
            onClick={handleExportExcel}
            className="rounded-xl bg-[#171717] hover:bg-[#171717]/85 text-white font-semibold text-xs shadow-sm h-10 px-4"
          >
            <Download className="mr-2 h-4 w-4 text-[#d51100]" />
            Export Excel (XLSX)
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Instansi"
            value="128"
            description="dari bulan lalu"
            trend="+6,1%"
            trendType="up"
            icon={Building2}
          />
          <StatCard
            title="Titik Layanan Aktif"
            value="420"
            description="titik terpasang"
            trend="+18 Titik"
            trendType="up"
            icon={Network}
          />
          <StatCard
            title="Pemerintahan"
            value="45 Satker"
            description="Pemkab & OPD"
            trend="+2 Satker"
            trendType="up"
            icon={Landmark}
          />
          <StatCard
            title="Sektor Pendidikan"
            value="52 Sekolah"
            description="Kampus & SMK/SMA"
            trend="+5 Sekolah"
            trendType="up"
            icon={GraduationCap}
          />
        </div>

        {/* Table & Filter Card */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#171717]">
                  Direktori Instansi Klien
                </CardTitle>
                <p className="text-xs text-[#5c5c5c]">
                  Total {filteredInstitutions.length} instansi terdata
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#5c5c5c]" />
                <input
                  type="text"
                  placeholder="Cari instansi, kode, PIC..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 pl-9 pr-4 text-xs text-[#171717] placeholder:text-[#5c5c5c] outline-none transition focus:border-[#171717] focus:bg-white"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#5c5c5c] shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 px-3 text-xs text-[#171717] outline-none cursor-pointer focus:border-[#171717] focus:bg-white"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Pemerintahan">Pemerintahan</option>
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="BUMD/BUMN">BUMD/BUMN</option>
                  <option value="Swasta">Swasta</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 px-3 text-xs text-[#171717] outline-none cursor-pointer focus:border-[#171717] focus:bg-white"
                >
                  <option value="Semua">Semua Status Kontrak</option>
                  <option value="Aktif">Status: Aktif</option>
                  <option value="Perpanjangan">Status: Perpanjangan</option>
                  <option value="Pending">Status: Pending</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                    <th className="px-5 py-3.5">Kode</th>
                    <th className="px-4 py-3.5">Nama Instansi</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5">Wilayah</th>
                    <th className="px-4 py-3.5">Kontak PIC</th>
                    <th className="px-4 py-3.5 text-center">Titik Layanan</th>
                    <th className="px-4 py-3.5 text-center">Masa Kontrak</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {paginatedData.map((inst) => (
                    <tr key={inst.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#171717]">
                        {inst.code}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-xs text-[#171717]">
                          {inst.name}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-[#f3f3f3] px-2 py-0.5 text-xs text-[#171717] font-medium">
                          {inst.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                        {inst.kecamatan}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <p className="font-medium text-[#171717]">{inst.picName}</p>
                        <p className="flex items-center gap-1 text-[11px] text-[#5c5c5c]">
                          <Phone className="h-3 w-3" />
                          {inst.picPhone}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#171717] px-2.5 py-0.5 text-xs font-bold text-white">
                          {inst.activePoints} / {inst.totalPoints}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-[#5c5c5c]">
                        s.d {inst.contractEnd}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {getStatusBadge(inst.status)}
                      </td>
                    </tr>
                  ))}

                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[#5c5c5c]">
                        Tidak ada data instansi yang sesuai dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col gap-3 border-t border-[#e5e5e5] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#5c5c5c]">
                Menampilkan{" "}
                <span className="font-semibold text-[#171717]">
                  {filteredInstitutions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-[#171717]">
                  {Math.min(currentPage * itemsPerPage, filteredInstitutions.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-[#171717]">
                  {filteredInstitutions.length}
                </span>{" "}
                instansi
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 rounded-lg px-2 text-xs border-[#e5e5e5] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                      currentPage === page
                        ? "bg-[#171717] text-white"
                        : "border border-[#e5e5e5] bg-white text-[#5c5c5c] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 rounded-lg px-2 text-xs border-[#e5e5e5] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { customersData, formatRupiah, Customer } from "@/lib/dummy-data";
import { exportToExcel } from "@/lib/excel";

export default function PelangganPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [kecamatanFilter, setKecamatanFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtered customers (tanpa filter instansi — pelanggan = perorangan)
  const filteredCustomers = useMemo(() => {
    return customersData.filter((cust) => {
      const matchSearch =
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.package.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "Semua" ? true : cust.status === statusFilter;

      const matchKecamatan =
        kecamatanFilter === "Semua" ? true : cust.kecamatan === kecamatanFilter;

      return matchSearch && matchStatus && matchKecamatan;
    });
  }, [searchTerm, statusFilter, kecamatanFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const handleExportExcel = () => {
    const exportData = filteredCustomers.map((c, idx) => ({
      No: idx + 1,
      "ID Pelanggan": c.id,
      "Nama Pelanggan": c.name,
      Email: c.email,
      Telepon: c.phone,
      Alamat: c.address,
      Kecamatan: c.kecamatan,
      Paket: c.package,
      Kecepatan: c.speed,
      "Biaya Bulanan": c.monthlyFee,
      "Tanggal Pasang": c.installDate,
      Status: c.status,
    }));
    exportToExcel(exportData, "Data_Pelanggan_IndiBiz");
  };

  const getStatusBadge = (status: Customer["status"]) => {
    switch (status) {
      case "Aktif":
        return <Badge variant="success">Aktif</Badge>;
      case "Menunggu Aktivasi":
        return <Badge variant="warning">Menunggu Aktivasi</Badge>;
      case "Nonaktif":
        return <Badge variant="secondary">Nonaktif</Badge>;
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
              Database Pelanggan
            </h1>
            <p className="text-xs text-[#5c5c5c]">
              Kelola direktori pelanggan perorangan terdaftar, paket berlangganan, dan status pemasangan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportExcel}
              className="rounded-xl bg-[#171717] hover:bg-[#171717]/85 text-white font-semibold text-xs shadow-sm h-10 px-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Download className="mr-2 h-4 w-4 text-[#d51100]" />
              Export Excel (XLSX)
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Pelanggan"
            value="3.420"
            description="dari bulan lalu"
            trend="+15,2%"
            trendType="up"
            icon={Users}
          />
          <StatCard
            title="Pelanggan Aktif"
            value="3.150"
            description="koneksi online"
            trend="+11,8%"
            trendType="up"
            icon={UserCheck}
          />
          <StatCard
            title="Baru Bulan Ini"
            value="180"
            description="pasang baru"
            trend="+24,0%"
            trendType="up"
            icon={UserPlus}
          />
          <StatCard
            title="Tingkat Churn"
            value="1,8%"
            description="sangat rendah"
            trend="-0,4%"
            trendType="down"
            icon={UserX}
          />
        </div>

        {/* Table & Filter Card */}
        <Card className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_4px_20px_rgba(23,23,23,0.05)]">
          <CardHeader className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#171717]">
                  Daftar Lengkap Pelanggan
                </CardTitle>
                <p className="text-xs text-[#5c5c5c]">
                  Total {filteredCustomers.length} pelanggan ditemukan
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {/* Search */}
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#5c5c5c]" />
                <input
                  type="text"
                  placeholder="Cari nama, ID, telepon, paket..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 pl-9 pr-4 text-xs text-[#171717] placeholder:text-[#5c5c5c] outline-none transition focus:border-[#171717] focus:bg-white"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#5c5c5c] shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 px-3 text-xs text-[#171717] outline-none cursor-pointer focus:border-[#171717] focus:bg-white"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Status: Aktif</option>
                  <option value="Menunggu Aktivasi">Status: Menunggu Aktivasi</option>
                  <option value="Nonaktif">Status: Nonaktif</option>
                </select>
              </div>

              {/* Kecamatan Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={kecamatanFilter}
                  onChange={(e) => {
                    setKecamatanFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5]/60 px-3 text-xs text-[#171717] outline-none cursor-pointer focus:border-[#171717] focus:bg-white"
                >
                  <option value="Semua">Semua Kecamatan</option>
                  <option value="Lumajang Kota">Lumajang Kota</option>
                  <option value="Sukodono">Sukodono</option>
                  <option value="Klakah">Klakah</option>
                  <option value="Pasirian">Pasirian</option>
                  <option value="Tempeh">Tempeh</option>
                  <option value="Senduro">Senduro</option>
                  <option value="Yosowilangun">Yosowilangun</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-[#e5e5e5] bg-[#fafafa] text-xs font-semibold text-[#5c5c5c]">
                    <th className="px-5 py-3.5">ID Pelanggan</th>
                    <th className="px-4 py-3.5">Nama Pelanggan</th>
                    <th className="px-4 py-3.5">Wilayah</th>
                    <th className="px-4 py-3.5">Paket &amp; Speed</th>
                    <th className="px-4 py-3.5 text-right">Biaya Bulanan</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-center">Tgl Pasang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {paginatedData.map((cust) => (
                    <tr
                      key={cust.id}
                      className="hover:bg-[#f5f5f5] transition-all duration-150 group"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#171717] group-hover:text-[#d51100] transition-colors duration-150">
                        {cust.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-xs text-[#171717]">
                          {cust.name}
                        </p>
                        <p className="text-[11px] text-[#5c5c5c]">{cust.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#5c5c5c]">
                        {cust.kecamatan}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-[#171717]">
                            {cust.package}
                          </span>
                          <span className="rounded bg-[#171717] px-1.5 py-0.5 text-[10px] font-bold text-white group-hover:bg-[#d51100] transition-colors duration-150">
                            {cust.speed}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-xs text-[#171717]">
                        {formatRupiah(cust.monthlyFee)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {getStatusBadge(cust.status)}
                      </td>
                      <td className="px-5 py-3.5 text-center text-xs text-[#5c5c5c]">
                        {cust.installDate}
                      </td>
                    </tr>
                  ))}

                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#5c5c5c]">
                        Tidak ada data pelanggan yang cocok dengan filter.
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
                  {filteredCustomers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-[#171717]">
                  {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-[#171717]">
                  {filteredCustomers.length}
                </span>{" "}
                pelanggan
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
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      currentPage === page
                        ? "bg-[#171717] text-white"
                        : "border border-[#e5e5e5] bg-white text-[#5c5c5c] hover:bg-[#f3f3f3] hover:-translate-y-0.5"
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

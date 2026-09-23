import { title } from "process";

export interface KpiData {
  title: string;
  value: string;
  trend: string;
  trendType: "up" | "down";
  description: string;
}

export interface DailyMetric {
  date: string;
  penjualan: number;
  revenue: number;
  occupancy: number;
}

export interface SellerPerformance {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  region: string;
  penjualan: number;
  revenue: number;
  target: number;
  progress: number;
  status: "Aktif" | "Cuti" | "Top Performer";
}

export interface WilayahData {
  id: string;
  kecamatan: string;
  lat: number;
  lng: number;
  penjualan: number;
  revenue: number;
  pelanggan: number;
  target: number;
  penetrasi: number;
}

export interface Transaction {
  id: string;
  customerName: string;
  institution: string;
  packageName: string;
  date: string;
  amount: number;
  status: "Selesai" | "Proses" | "Pending" | "Batal";
  sellerName: string;
  region: string;
}

export interface Customer {
  id: string;
  name: string;
  institution: string;
  email: string;
  phone: string;
  address: string;
  kecamatan: string;
  package: string;
  speed: string;
  monthlyFee: number;
  installDate: string;
  status: "Aktif" | "Nonaktif" | "Menunggu Aktivasi";
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  category: "Pendidikan" | "Pemerintahan" | "Kesehatan" | "BUMD/BUMN" | "Swasta";
  kecamatan: string;
  picName: string;
  picPhone: string;
  activePoints: number;
  totalPoints: number;
  status: "Aktif" | "Perpanjangan" | "Pending";
  contractEnd: string;
}

export interface HeatmapPoint {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  intensity: number; // 0.1 to 1.0
  activeUsers: number;
  bandwidthUsage: string;
}

// =========================================================
// DASHBOARD OVERVIEW KPI
// =========================================================
export const dashboardKpi = {
  totalPenjualan: {
    title: "Total Penjualan",
    value: "1.250",
    trend: "+12,4%",
    trendType: "up" as const,
    description: "dari bulan lalu",
  },
  totalRevenue: {
    title: "Total Revenue",
    value: "Rp 845,2 Jt",
    trend: "+8,7%",
    trendType: "up" as const,
    description: "dari bulan lalu",
  },
  totalPelanggan: {
    title: "Total Pelanggan",
    value: "3.420",
    trend: "+15,2%",
    trendType: "up" as const,
    description: "dari bulan lalu",
  },
  totalInstansi: {
    title: "Total Instansi",
    value: "128",
    trend: "+6,1%",
    trendType: "up" as const,
    description: "dari bulan lalu",
  },
  occupancy: {
    title: "Occupancy Jaringan",
    value: "78,4%",
    percentage: 78.4,
    description: "Kapasitas jaringan terpakai",
    target: "Batas aman: 85%",
  },
  c3mr: {
    title: "C3MR",
    value: "94,56%",
    percentage: 94.56,
    description: "C3MR NYA",
  }
};

// =========================================================
// DAILY ANALYTICS DATA (FOR LINE & REVENUE CHARTS)
// =========================================================
export const dailyAnalyticsData: DailyMetric[] = [
  { date: "2026-09-01", penjualan: 28, revenue: 19600000, occupancy: 71.2 },
  { date: "2026-09-02", penjualan: 35, revenue: 24500000, occupancy: 71.8 },
  { date: "2026-09-03", penjualan: 31, revenue: 21700000, occupancy: 72.1 },
  { date: "2026-09-04", penjualan: 42, revenue: 29400000, occupancy: 72.9 },
  { date: "2026-09-05", penjualan: 38, revenue: 26600000, occupancy: 73.4 },
  { date: "2026-09-06", penjualan: 48, revenue: 33600000, occupancy: 74.0 },
  { date: "2026-09-07", penjualan: 54, revenue: 37800000, occupancy: 74.8 },
  { date: "2026-09-08", penjualan: 46, revenue: 32200000, occupancy: 75.1 },
  { date: "2026-09-09", penjualan: 59, revenue: 41300000, occupancy: 75.9 },
  { date: "2026-09-10", penjualan: 52, revenue: 36400000, occupancy: 76.2 },
  { date: "2026-09-11", penjualan: 63, revenue: 44100000, occupancy: 76.8 },
  { date: "2026-09-12", penjualan: 60, revenue: 42000000, occupancy: 77.2 },
  { date: "2026-09-13", penjualan: 68, revenue: 47600000, occupancy: 77.8 },
  { date: "2026-09-14", penjualan: 72, revenue: 50400000, occupancy: 78.1 },
  { date: "2026-09-15", penjualan: 65, revenue: 45500000, occupancy: 78.3 },
  { date: "2026-09-16", penjualan: 78, revenue: 54600000, occupancy: 78.4 },
  { date: "2026-09-17", penjualan: 82, revenue: 57400000, occupancy: 78.6 },
];

// =========================================================
// TOP SELLERS (DUMMY DATA)
// =========================================================
export const sellerData: SellerPerformance[] = [
  {
    id: "SEL-001",
    rank: 1,
    name: "Budi Santoso",
    avatar: "BS",
    email: "budi.santoso@indibiz.id",
    phone: "0812-3456-7890",
    region: "Lumajang Kota",
    penjualan: 185,
    revenue: 129500000,
    target: 150,
    progress: 123.3,
    status: "Top Performer",
  },
  {
    id: "SEL-002",
    rank: 2,
    name: "Siti Rahmawati",
    avatar: "SR",
    email: "siti.rahmawati@indibiz.id",
    phone: "0813-9876-5432",
    region: "Sukodono",
    penjualan: 164,
    revenue: 114800000,
    target: 150,
    progress: 109.3,
    status: "Top Performer",
  },
  {
    id: "SEL-003",
    rank: 3,
    name: "Ahmad Fauzi",
    avatar: "AF",
    email: "ahmad.fauzi@indibiz.id",
    phone: "0821-4455-6677",
    region: "Klakah",
    penjualan: 142,
    revenue: 99400000,
    target: 140,
    progress: 101.4,
    status: "Aktif",
  },
  {
    id: "SEL-004",
    rank: 4,
    name: "Dewi Lestari",
    avatar: "DL",
    email: "dewi.lestari@indibiz.id",
    phone: "0852-3322-1100",
    region: "Pasirian",
    penjualan: 128,
    revenue: 89600000,
    target: 140,
    progress: 91.4,
    status: "Aktif",
  },
  {
    id: "SEL-005",
    rank: 5,
    name: "Hendra Wijaya",
    avatar: "HW",
    email: "hendra.wijaya@indibiz.id",
    phone: "0878-1122-3344",
    region: "Tempeh",
    penjualan: 115,
    revenue: 80500000,
    target: 130,
    progress: 88.5,
    status: "Aktif",
  },
  {
    id: "SEL-006",
    rank: 6,
    name: "Rizky Pratama",
    avatar: "RP",
    email: "rizky.pratama@indibiz.id",
    phone: "0896-5544-3322",
    region: "Senduro",
    penjualan: 98,
    revenue: 68600000,
    target: 120,
    progress: 81.6,
    status: "Aktif",
  },
  {
    id: "SEL-007",
    rank: 7,
    name: "Nurul Hidayati",
    avatar: "NH",
    email: "nurul.hidayati@indibiz.id",
    phone: "0812-7788-9900",
    region: "Yosowilangun",
    penjualan: 89,
    revenue: 62300000,
    target: 110,
    progress: 80.9,
    status: "Cuti",
  },
];

// =========================================================
// WILAYAH / KECAMATAN DATA (LUMAJANG FOCUS)
// =========================================================
export const wilayahData: WilayahData[] = [
  {
    id: "WIL-01",
    kecamatan: "Lumajang Kota",
    lat: -8.1332,
    lng: 113.2245,
    penjualan: 380,
    revenue: 266000000,
    pelanggan: 1040,
    target: 400,
    penetrasi: 95.0,
  },
  {
    id: "WIL-02",
    kecamatan: "Sukodono",
    lat: -8.1065,
    lng: 113.2381,
    penjualan: 245,
    revenue: 171500000,
    pelanggan: 680,
    target: 260,
    penetrasi: 94.2,
  },
  {
    id: "WIL-03",
    kecamatan: "Klakah",
    lat: -7.9892,
    lng: 113.2575,
    penjualan: 182,
    revenue: 127400000,
    pelanggan: 490,
    target: 200,
    penetrasi: 91.0,
  },
  {
    id: "WIL-04",
    kecamatan: "Pasirian",
    lat: -8.2163,
    lng: 113.1092,
    penjualan: 168,
    revenue: 117600000,
    pelanggan: 430,
    target: 190,
    penetrasi: 88.4,
  },
  {
    id: "WIL-05",
    kecamatan: "Tempeh",
    lat: -8.1925,
    lng: 113.1812,
    penjualan: 145,
    revenue: 101500000,
    pelanggan: 390,
    target: 170,
    penetrasi: 85.3,
  },
  {
    id: "WIL-06",
    kecamatan: "Senduro",
    lat: -8.1008,
    lng: 113.1118,
    penjualan: 118,
    revenue: 82600000,
    pelanggan: 320,
    target: 140,
    penetrasi: 84.3,
  },
  {
    id: "WIL-07",
    kecamatan: "Yosowilangun",
    lat: -8.2435,
    lng: 113.2872,
    penjualan: 96,
    revenue: 67200000,
    pelanggan: 280,
    target: 120,
    penetrasi: 80.0,
  },
  {
    id: "WIL-08",
    kecamatan: "Rowokangkung",
    lat: -8.1751,
    lng: 113.2819,
    penjualan: 84,
    revenue: 58800000,
    pelanggan: 230,
    target: 110,
    penetrasi: 76.4,
  },
];

// =========================================================
// HEATMAP / MAP POINTS (LUMAJANG AREA)
// =========================================================
export const heatmapPoints: HeatmapPoint[] = [
  {
    id: 1,
    name: "Pusat Pemerintahan Kab. Lumajang",
    category: "Pemerintahan",
    lat: -8.1332,
    lng: 113.2245,
    intensity: 0.95,
    activeUsers: 340,
    bandwidthUsage: "850 Mbps",
  },
  {
    id: 2,
    name: "RSUD dr. Haryoto Lumajang",
    category: "Kesehatan",
    lat: -8.1285,
    lng: 113.2212,
    intensity: 0.88,
    activeUsers: 210,
    bandwidthUsage: "520 Mbps",
  },
  {
    id: 3,
    name: "SMKN 1 Lumajang (Pendidikan)",
    category: "Pendidikan",
    lat: -8.1402,
    lng: 113.2185,
    intensity: 0.76,
    activeUsers: 185,
    bandwidthUsage: "400 Mbps",
  },
  {
    id: 4,
    name: "Area Bisnis & Perdagangan Sukodono",
    category: "Komersial",
    lat: -8.1065,
    lng: 113.2381,
    intensity: 0.82,
    activeUsers: 160,
    bandwidthUsage: "380 Mbps",
  },
  {
    id: 5,
    name: "Sentra UKM & Agribisnis Senduro",
    category: "Komersial",
    lat: -8.1008,
    lng: 113.1118,
    intensity: 0.65,
    activeUsers: 120,
    bandwidthUsage: "250 Mbps",
  },
  {
    id: 6,
    name: "Kawasan Niaga Tempeh",
    category: "Komersial",
    lat: -8.1925,
    lng: 113.1812,
    intensity: 0.72,
    activeUsers: 140,
    bandwidthUsage: "310 Mbps",
  },
  {
    id: 7,
    name: "Distrik Pasirian Selatan",
    category: "Residensial & Bisnis",
    lat: -8.2163,
    lng: 113.1092,
    intensity: 0.68,
    activeUsers: 115,
    bandwidthUsage: "270 Mbps",
  },
  {
    id: 8,
    name: "Sentra Klakah Utara (Logistik & Pasar)",
    category: "Komersial",
    lat: -7.9892,
    lng: 113.2575,
    intensity: 0.79,
    activeUsers: 155,
    bandwidthUsage: "340 Mbps",
  },
];

// =========================================================
// TRANSACTIONS LIST (FOR PENJUALAN PAGE)
// =========================================================
export const transactionsData: Transaction[] = [
  {
    id: "TRX-2026-0916-01",
    customerName: "Dinas Kominfo Kab. Lumajang",
    institution: "Pemkab Lumajang",
    packageName: "IndiBiz Enterprise 100M",
    date: "2026-09-16",
    amount: 3500000,
    status: "Selesai",
    sellerName: "Budi Santoso",
    region: "Lumajang Kota",
  },
  {
    id: "TRX-2026-0916-02",
    customerName: "Klinik Pratama Rawat Inap Sehat",
    institution: "Swasta",
    packageName: "IndiBiz Bisnis 50M",
    date: "2026-09-16",
    amount: 1750000,
    status: "Selesai",
    sellerName: "Siti Rahmawati",
    region: "Sukodono",
  },
  {
    id: "TRX-2026-0915-01",
    customerName: "SMK Wira Bakti Lumajang",
    institution: "Pendidikan",
    packageName: "IndiBiz Edu Pro 100M",
    date: "2026-09-15",
    amount: 2800000,
    status: "Selesai",
    sellerName: "Ahmad Fauzi",
    region: "Klakah",
  },
  {
    id: "TRX-2026-0915-02",
    customerName: "CV Surya Makmur Abadi",
    institution: "Swasta",
    packageName: "IndiBiz Starter 30M",
    date: "2026-09-15",
    amount: 950000,
    status: "Proses",
    sellerName: "Dewi Lestari",
    region: "Pasirian",
  },
  {
    id: "TRX-2026-0914-01",
    customerName: "Kantor Kecamatan Senduro",
    institution: "Pemerintahan",
    packageName: "IndiBiz Gov 50M",
    date: "2026-09-14",
    amount: 1900000,
    status: "Selesai",
    sellerName: "Rizky Pratama",
    region: "Senduro",
  },
  {
    id: "TRX-2026-0914-02",
    customerName: "UD Bintang Jaya Sentosa",
    institution: "Swasta",
    packageName: "IndiBiz Retail 30M",
    date: "2026-09-14",
    amount: 950000,
    status: "Pending",
    sellerName: "Hendra Wijaya",
    region: "Tempeh",
  },
  {
    id: "TRX-2026-0913-01",
    customerName: "Koperasi Unit Desa Yosowilangun",
    institution: "BUMD/BUMN",
    packageName: "IndiBiz Bisnis 50M",
    date: "2026-09-13",
    amount: 1750000,
    status: "Selesai",
    sellerName: "Nurul Hidayati",
    region: "Yosowilangun",
  },
  {
    id: "TRX-2026-0913-02",
    customerName: "Hotel Prima Lumajang",
    institution: "Swasta",
    packageName: "IndiBiz Hospitality 200M",
    date: "2026-09-13",
    amount: 6500000,
    status: "Selesai",
    sellerName: "Budi Santoso",
    region: "Lumajang Kota",
  },
  {
    id: "TRX-2026-0912-01",
    customerName: "Puskesmas Klakah",
    institution: "Kesehatan",
    packageName: "IndiBiz Health 50M",
    date: "2026-09-12",
    amount: 1850000,
    status: "Selesai",
    sellerName: "Ahmad Fauzi",
    region: "Klakah",
  },
  {
    id: "TRX-2026-0912-02",
    customerName: "Toko Sembako Barokah",
    institution: "Swasta",
    packageName: "IndiBiz Starter 20M",
    date: "2026-09-12",
    amount: 650000,
    status: "Batal",
    sellerName: "Dewi Lestari",
    region: "Pasirian",
  },
  {
    id: "TRX-2026-0911-01",
    customerName: "Bappeda Kabupaten Lumajang",
    institution: "Pemerintahan",
    packageName: "IndiBiz Enterprise 150M",
    date: "2026-09-11",
    amount: 4800000,
    status: "Selesai",
    sellerName: "Budi Santoso",
    region: "Lumajang Kota",
  },
];

// =========================================================
// CUSTOMERS LIST (FOR PELANGGAN PAGE)
// =========================================================
export const customersData: Customer[] = [
  {
    id: "CUST-001",
    name: "Dr. Bambang Setiawan, Sp.A",
    institution: "RSUD dr. Haryoto Lumajang",
    email: "bambang.setiawan@rsudharyoto.id",
    phone: "0812-3401-9922",
    address: "Jl. Basuki Rahmat No. 10",
    kecamatan: "Lumajang Kota",
    package: "IndiBiz Pro 100M",
    speed: "100 Mbps",
    monthlyFee: 1850000,
    installDate: "2025-10-14",
    status: "Aktif",
  },
  {
    id: "CUST-002",
    name: "Ir. Hj. Sri Wahyuni",
    institution: "Dinas Pertanian Lumajang",
    email: "sri.wahyuni@lumajangkab.go.id",
    phone: "0813-8822-4411",
    address: "Jl. Gatot Subroto No. 45",
    kecamatan: "Sukodono",
    package: "IndiBiz Gov 50M",
    speed: "50 Mbps",
    monthlyFee: 1450000,
    installDate: "2025-11-20",
    status: "Aktif",
  },
  {
    id: "CUST-003",
    name: "H. Abdul Rozak, S.Pd",
    institution: "SMKN 1 Lumajang",
    email: "kepsek@smkn1lumajang.sch.id",
    phone: "0821-9900-1122",
    address: "Jl. Suwandak No. 12",
    kecamatan: "Lumajang Kota",
    package: "IndiBiz Edu Campus 200M",
    speed: "200 Mbps",
    monthlyFee: 3200000,
    installDate: "2025-08-05",
    status: "Aktif",
  },
  {
    id: "CUST-004",
    name: "M. Taufiq Ridho",
    institution: "PT Agrojaya Lumajang",
    email: "taufiq@agrojaya.co.id",
    phone: "0852-7711-2233",
    address: "Kawasan Industri Klakah No. 8",
    kecamatan: "Klakah",
    package: "IndiBiz Corp 100M",
    speed: "100 Mbps",
    monthlyFee: 2400000,
    installDate: "2026-01-18",
    status: "Aktif",
  },
  {
    id: "CUST-005",
    name: "Eko Prasetyo",
    institution: "CV Pasirian Mandiri",
    email: "eko.p@pasirianmandiri.com",
    phone: "0878-4455-6611",
    address: "Jl. Raya Pasirian No. 90",
    kecamatan: "Pasirian",
    package: "IndiBiz Starter 30M",
    speed: "30 Mbps",
    monthlyFee: 750000,
    installDate: "2026-03-10",
    status: "Aktif",
  },
  {
    id: "CUST-006",
    name: "Indah Permatasari",
    institution: "Apotek Medika Tempeh",
    email: "indah@apotekmedika.id",
    phone: "0896-1122-8877",
    address: "Jl. Pasar Lama Tempeh No. 3",
    kecamatan: "Tempeh",
    package: "IndiBiz Retail 50M",
    speed: "50 Mbps",
    monthlyFee: 1100000,
    installDate: "2026-05-22",
    status: "Aktif",
  },
  {
    id: "CUST-007",
    name: "Drs. Sugeng Waluyo",
    institution: "Puskesmas Senduro",
    email: "pusk.senduro@dinkeslumajang.id",
    phone: "0812-9988-7766",
    address: "Jl. Bromo Senduro No. 15",
    kecamatan: "Senduro",
    package: "IndiBiz Health 50M",
    speed: "50 Mbps",
    monthlyFee: 1450000,
    installDate: "2026-07-01",
    status: "Aktif",
  },
  {
    id: "CUST-008",
    name: "Rian Hendrawan",
    institution: "Kafe Kopi Semeru",
    email: "rian@kopisemeru.com",
    phone: "0813-2211-9988",
    address: "Jl. Alun-Alun Lumajang No. 4",
    kecamatan: "Lumajang Kota",
    package: "IndiBiz F&B 50M",
    speed: "50 Mbps",
    monthlyFee: 950000,
    installDate: "2026-08-12",
    status: "Menunggu Aktivasi",
  },
  {
    id: "CUST-009",
    name: "Haryono Subekti",
    institution: "Gudang Logistik Yosowilangun",
    email: "haryono@logistikyoso.id",
    phone: "0852-6677-8899",
    address: "Jl. Pantai Selatan No. 88",
    kecamatan: "Yosowilangun",
    package: "IndiBiz Starter 20M",
    speed: "20 Mbps",
    monthlyFee: 550000,
    installDate: "2025-06-19",
    status: "Nonaktif",
  },
];

// =========================================================
// INSTITUTIONS LIST (FOR INSTANSI PAGE)
// =========================================================
export const institutionsData: Institution[] = [
  {
    id: "INST-001",
    code: "GOV-LMJ-01",
    name: "Dinas Kominfo Kab. Lumajang",
    category: "Pemerintahan",
    kecamatan: "Lumajang Kota",
    picName: "Drs. Hendri Purnomo, M.Si",
    picPhone: "0812-3344-5566",
    activePoints: 18,
    totalPoints: 18,
    status: "Aktif",
    contractEnd: "2027-12-31",
  },
  {
    id: "INST-002",
    code: "HLT-LMJ-02",
    name: "RSUD dr. Haryoto Lumajang",
    category: "Kesehatan",
    kecamatan: "Lumajang Kota",
    picName: "dr. Tri Astuti",
    picPhone: "0813-5566-7788",
    activePoints: 12,
    totalPoints: 12,
    status: "Aktif",
    contractEnd: "2027-06-30",
  },
  {
    id: "INST-003",
    code: "EDU-LMJ-03",
    name: "SMKN 1 Lumajang",
    category: "Pendidikan",
    kecamatan: "Lumajang Kota",
    picName: "Zainal Abidin, S.Pd",
    picPhone: "0821-4433-2211",
    activePoints: 8,
    totalPoints: 8,
    status: "Aktif",
    contractEnd: "2026-11-30",
  },
  {
    id: "INST-004",
    code: "GOV-LMJ-04",
    name: "Bappeda Kabupaten Lumajang",
    category: "Pemerintahan",
    kecamatan: "Lumajang Kota",
    picName: "Ir. Anang Prasetya",
    picPhone: "0852-1122-3344",
    activePoints: 6,
    totalPoints: 6,
    status: "Aktif",
    contractEnd: "2027-03-31",
  },
  {
    id: "INST-005",
    code: "EDU-LMJ-05",
    name: "Universitas Jember Kampus Lumajang",
    category: "Pendidikan",
    kecamatan: "Sukodono",
    picName: "Prof. Dr. Ir. Suyitno",
    picPhone: "0812-9900-3344",
    activePoints: 15,
    totalPoints: 16,
    status: "Perpanjangan",
    contractEnd: "2026-10-15",
  },
  {
    id: "INST-006",
    code: "BUMD-LMJ-06",
    name: "Perumda Tirta Mahameru (PDAM Lumajang)",
    category: "BUMD/BUMN",
    kecamatan: "Lumajang Kota",
    picName: "Bagus Setiawan, ST",
    picPhone: "0878-2233-4455",
    activePoints: 9,
    totalPoints: 10,
    status: "Aktif",
    contractEnd: "2027-08-31",
  },
  {
    id: "INST-007",
    code: "HLT-LMJ-07",
    name: "RSUD Pasirian",
    category: "Kesehatan",
    kecamatan: "Pasirian",
    picName: "dr. Wulan Safitri",
    picPhone: "0896-3344-5511",
    activePoints: 7,
    totalPoints: 7,
    status: "Aktif",
    contractEnd: "2027-01-31",
  },
  {
    id: "INST-008",
    code: "CORP-LMJ-08",
    name: "PT Pabrik Gula Djatiroto",
    category: "BUMD/BUMN",
    kecamatan: "Rowokangkung",
    picName: "Ir. Joko Susilo",
    picPhone: "0813-7788-9900",
    activePoints: 14,
    totalPoints: 14,
    status: "Aktif",
    contractEnd: "2028-05-31",
  },
];

// Helper to format Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to format short Rupiah (e.g., Rp 845,2 Jt)
export function formatShortRupiah(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1).replace(".", ",")} M`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1).replace(".", ",")} Jt`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)} Rb`;
  }
  return `Rp ${amount}`;
}

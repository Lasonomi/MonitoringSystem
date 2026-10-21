import { recordActivity } from "@/lib/activity-log";

/**
 * api.ts
 * Thin client untuk berkomunikasi dengan Laravel backend.
 * Semua endpoint relatif terhadap /api (di-proxy ke http://127.0.0.1:8000/api).
 */

const BASE = "/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderRecord {
  id: number;
  order_id: string | null;
  sto: string | null;
  datel: string | null;
  type_transaksi: string | null;
  channel_1: string | null;
  status: string | null;
  payment_status: string | null;
  customer_id: string | null;
  amount: number | string | null;
  order_date: string | null;
  cust_name: string | null;
  cust_address: string | null;
  city_name: string | null;
  package: string | null;
  jenis_layanan: string | null;
  speed_package: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OrdersResponse {
  success: boolean;
  data: OrderRecord[];
  meta: PaginationMeta;
}

export interface StatsResponse {
  success: boolean;
  total_orders: number;
  all_total_orders: number;
  all_payable_orders: number;
  by_status: Record<string, number>;
  by_city: { city_name: string; count: number }[];
  by_package: { package: string; count: number }[];
  by_service_type: { jenis_layanan: string; count: number }[];
  by_date: { date: string; count: number }[];
  by_type_transaksi: { type_transaksi: string; count: number }[];
  by_sto?: { sto: string; count: number }[];
  by_datel?: { datel: string; count: number }[];
  total_revenue: number;
  amount_orders: number;
  payment_status_orders: number;
  paid_orders: number;
  unpaid_orders: number;
  total_customers: number;
  identified_customer_orders: number;
}

export interface MetaResponse {
  success: boolean;
  has_data: boolean;
  total_orders: number;
  min_order_date: string | null;
  statuses: string[];
  payment_statuses: string[];
  cities: string[];
  packages: string[];
  service_types: string[];
  stos: string[];
  datels: string[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  imported?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  filtered?: number;
  new_customers?: number;
  total_revenue?: number;
  columns?: string[];
}

export interface UploadReportSnapshot {
  id: number;
  file_name: string;
  imported_orders: number;
  identified_customers: number;
  new_customers: number;
  total_revenue: number | string;
  created_at: string;
}

export interface UploadReportSummary {
  success: boolean;
  latest: UploadReportSnapshot | null;
  previous: UploadReportSnapshot | null;
  growth_percent: number | null;
}

// ─── Query params helper ───────────────────────────────────────────────────────

type OrderParams = {
  search?: string;
  status?: string;
  city?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
};

function buildQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, String(v));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.substring(jsonStart, jsonEnd + 1)) as T;
    }
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 200) || `Respons server tidak valid (${res.status})`);
  }
}

// ─── API functions ─────────────────────────────────────────────────────────────

/**
 * Upload file Excel ke backend untuk diimport ke database.
 */
export async function uploadOrders(file: File, datelFilter?: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  if (datelFilter) form.append("datel_filter", datelFilter);

  const res = await fetch(`${BASE}/orders/upload`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: form,
  });

  const data = await parseJsonResponse<UploadResponse>(res);

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Upload gagal (${res.status})`);
  }

  recordActivity("upload", file.name);
  return data;
}

/**
 * Ambil daftar order dengan filter & pagination.
 */
export async function fetchOrders(params: OrderParams = {}): Promise<OrdersResponse> {
  const res = await fetch(`${BASE}/orders${buildQuery(params as Record<string, unknown>)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Gagal mengambil data order (${res.status})`);
  return parseJsonResponse<OrdersResponse>(res);
}

/**
 * Ambil statistik agregat untuk dashboard.
 */
export async function fetchStats(params: { start_date?: string; end_date?: string } = {}): Promise<StatsResponse> {
  const res = await fetch(`${BASE}/orders/stats${buildQuery(params as Record<string, unknown>)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Gagal mengambil statistik (${res.status})`);
  return parseJsonResponse<StatsResponse>(res);
}

/**
 * Ambil metadata: daftar status, kota, paket unik.
 */
export async function fetchMeta(): Promise<MetaResponse> {
  const res = await fetch(`${BASE}/orders/meta`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Gagal mengambil metadata (${res.status})`);
  return parseJsonResponse<MetaResponse>(res);
}

export async function fetchUploadReportSummary(): Promise<UploadReportSummary> {
  const res = await fetch(`${BASE}/orders/reports/summary`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Gagal mengambil ringkasan laporan (${res.status})`);
  return parseJsonResponse<UploadReportSummary>(res);
}

/**
 * Hapus semua data order dari database.
 */
export async function clearOrders(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE}/orders/clear`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Gagal menghapus data (${res.status})`);
  return parseJsonResponse<{ success: boolean; message: string }>(res);
}

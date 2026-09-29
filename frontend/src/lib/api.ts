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
  status: string | null;
  order_date: string | null;
  cust_name: string | null;
  cust_address: string | null;
  city_name: string | null;
  package: string | null;
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
  by_status: Record<string, number>;
  by_city: { city_name: string; count: number }[];
  by_package: { package: string; count: number }[];
  by_date: { date: string; count: number }[];
  by_type_transaksi: { type_transaksi: string; count: number }[];
  by_sto?: { sto: string; count: number }[];
  by_datel?: { datel: string; count: number }[];
}

export interface MetaResponse {
  success: boolean;
  has_data: boolean;
  statuses: string[];
  cities: string[];
  packages: string[];
  stos: string[];
  datels: string[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  imported?: number;
  skipped?: number;
  columns?: string[];
}

// ─── Query params helper ───────────────────────────────────────────────────────

type OrderParams = {
  search?: string;
  status?: string;
  city?: string;
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
export async function uploadOrders(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

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

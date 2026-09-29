<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use PhpOffice\PhpSpreadsheet\IOFactory;

class OrderController extends Controller
{
    // ──────────────────────────────────────────────────────────────
    // MAPPING: normalisasi nama kolom dari Excel → field DB
    // Menerima variasi nama kolom (case-insensitive)
    // ──────────────────────────────────────────────────────────────
    private array $columnMap = [
        // order_id
        'order id'        => 'order_id',
        'order_id'        => 'order_id',
        'orderid'         => 'order_id',
        'id order'        => 'order_id',
        'no order'        => 'order_id',
        'nomor order'     => 'order_id',

        // sto
        'sto'             => 'sto',

        // datel
        'datel'           => 'datel',

        // type_transaksi
        'type transaksi'  => 'type_transaksi',
        'type_transaksi'  => 'type_transaksi',
        'tipe transaksi'  => 'type_transaksi',
        'jenis transaksi' => 'type_transaksi',
        'transaksi'       => 'type_transaksi',

        // status
        'status'          => 'status',

        // order_date
        'order date'      => 'order_date',
        'order_date'      => 'order_date',
        'tanggal order'   => 'order_date',
        'tgl order'       => 'order_date',
        'tanggal'         => 'order_date',
        'date'            => 'order_date',

        // cust_name
        'cust name'       => 'cust_name',
        'cust_name'       => 'cust_name',
        'customer name'   => 'cust_name',
        'nama customer'   => 'cust_name',
        'nama pelanggan'  => 'cust_name',
        'pelanggan'       => 'cust_name',
        'nama'            => 'cust_name',

        // cust_address
        'cust address'    => 'cust_address',
        'cust_address'    => 'cust_address',
        'customer address'=> 'cust_address',
        'alamat customer' => 'cust_address',
        'alamat'          => 'cust_address',
        'address'         => 'cust_address',

        // city_name
        'city name'       => 'city_name',
        'city_name'       => 'city_name',
        'kota'            => 'city_name',
        'kota/kecamatan'  => 'city_name',
        'kecamatan'       => 'city_name',
        'city'            => 'city_name',

        // package
        'package'         => 'package',
        'paket'           => 'package',
        'paket layanan'   => 'package',
        'layanan'         => 'package',
        'product'         => 'package',
        'produk'          => 'package',
    ];

    // ──────────────────────────────────────────────────────────────
    // POST /api/orders/upload
    // Menerima file Excel (.xlsx/.xls/.csv), parse, simpan ke DB
    public function upload(Request $request): JsonResponse
    {
        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan atau terjadi kesalahan saat upload.',
            ], 422);
        }

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());
        $validExts = ['xlsx', 'xls', 'csv', 'txt'];

        if (!in_array($ext, $validExts)) {
            return response()->json([
                'success' => false,
                'message' => "Format file tidak didukung (.{$ext}). Harap upload file berekstensi .xlsx, .xls, atau .csv.",
            ], 422);
        }

        // Batas maksimal 50 MB
        if ($file->getSize() > 50 * 1024 * 1024) {
            return response()->json([
                'success' => false,
                'message' => 'Ukuran file terlalu besar (maksimal 50 MB).',
            ], 422);
        }

        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet       = $spreadsheet->getActiveSheet();
            $rows        = $sheet->toArray(null, true, true, true);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membaca file: ' . $e->getMessage(),
            ], 422);
        }

        if (empty($rows)) {
            return response()->json([
                'success' => false,
                'message' => 'File kosong atau tidak bisa dibaca.',
            ], 422);
        }

        // Baris pertama = header
        $headerRow  = array_shift($rows);
        $fieldIndex = $this->buildFieldIndex($headerRow);

        if (empty($fieldIndex)) {
            return response()->json([
                'success' => false,
                'message' => 'Header kolom tidak dikenali. Pastikan file menggunakan kolom: ORDER ID, STO, DATEL, TYPE TRANSAKSI, STATUS, ORDER DATE, CUST NAME, CUST ADDRESS, CITY NAME, PACKAGE.',
            ], 422);
        }

        // Hapus data lama sebelum import baru
        Order::truncate();

        $imported = 0;
        $skipped  = 0;
        $batch    = [];

        foreach ($rows as $row) {
            // Skip baris kosong
            $values = array_filter(array_values($row), fn($v) => $v !== null && $v !== '');
            if (empty($values)) {
                $skipped++;
                continue;
            }

            $record = [];
            foreach ($fieldIndex as $colLetter => $dbField) {
                $raw = $row[$colLetter] ?? null;
                $record[$dbField] = $this->castValue($dbField, $raw);
            }

            $now = now()->toDateTimeString();
            $record['created_at'] = $now;
            $record['updated_at'] = $now;

            $batch[] = $record;
            $imported++;

            // Batch insert setiap 500 baris
            if (count($batch) >= 500) {
                Order::insert($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            Order::insert($batch);
        }

        return response()->json([
            'success'  => true,
            'message'  => "Berhasil mengimport {$imported} data order.",
            'imported' => $imported,
            'skipped'  => $skipped,
            'columns'  => array_values($fieldIndex),
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // GET /api/orders
    // Daftar order dengan filter & pagination
    // ──────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Order::query();

        // Filter pencarian
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_id',   'like', "%{$search}%")
                  ->orWhere('cust_name','like', "%{$search}%")
                  ->orWhere('package',  'like', "%{$search}%")
                  ->orWhere('sto',      'like', "%{$search}%")
                  ->orWhere('datel',    'like', "%{$search}%");
            });
        }

        // Filter status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Filter wilayah/kota
        if ($city = $request->query('city')) {
            $query->where('city_name', $city);
        }

        // Filter tanggal
        if ($startDate = $request->query('start_date')) {
            $query->whereDate('order_date', '>=', $startDate);
        }
        if ($endDate = $request->query('end_date')) {
            $query->whereDate('order_date', '<=', $endDate);
        }

        // Pagination
        $perPage = (int) ($request->query('per_page', 50));
        $perPage = min(max($perPage, 1), 200);

        $paginated = $query->orderBy('order_date', 'desc')
                           ->orderBy('id', 'desc')
                           ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $paginated->items(),
            'meta'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // GET /api/orders/stats
    // Statistik agregat untuk dashboard
    // ──────────────────────────────────────────────────────────────
    public function stats(Request $request): JsonResponse
    {
        $query = Order::query();

        if ($startDate = $request->query('start_date')) {
            $query->whereDate('order_date', '>=', $startDate);
        }
        if ($endDate = $request->query('end_date')) {
            $query->whereDate('order_date', '<=', $endDate);
        }

        $total   = $query->count();
        $byStatus = (clone $query)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $byCity = (clone $query)
            ->selectRaw('city_name, COUNT(*) as count')
            ->groupBy('city_name')
            ->orderByDesc('count')
            ->get();

        $byPackage = (clone $query)
            ->selectRaw('package, COUNT(*) as count')
            ->groupBy('package')
            ->orderByDesc('count')
            ->get();

        $byDate = (clone $query)
            ->selectRaw('DATE(order_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $byTypeTransaksi = (clone $query)
            ->selectRaw('type_transaksi, COUNT(*) as count')
            ->groupBy('type_transaksi')
            ->orderByDesc('count')
            ->get();

        $bySto = (clone $query)
            ->selectRaw('sto, COUNT(*) as count')
            ->whereNotNull('sto')
            ->groupBy('sto')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $byDatel = (clone $query)
            ->selectRaw('datel, COUNT(*) as count')
            ->whereNotNull('datel')
            ->groupBy('datel')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        return response()->json([
            'success'           => true,
            'total_orders'      => $total,
            'by_status'         => $byStatus,
            'by_city'           => $byCity,
            'by_package'        => $byPackage,
            'by_date'           => $byDate,
            'by_type_transaksi' => $byTypeTransaksi,
            'by_sto'            => $bySto,
            'by_datel'          => $byDatel,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // GET /api/orders/meta
    // Nilai unik untuk dropdown filter
    // ──────────────────────────────────────────────────────────────
    public function meta(): JsonResponse
    {
        $statuses  = Order::distinct()->pluck('status')->filter()->values();
        $cities    = Order::distinct()->orderBy('city_name')->pluck('city_name')->filter()->values();
        $packages  = Order::distinct()->orderBy('package')->pluck('package')->filter()->values();
        $stos      = Order::distinct()->orderBy('sto')->pluck('sto')->filter()->values();
        $datels    = Order::distinct()->orderBy('datel')->pluck('datel')->filter()->values();
        $hasData   = Order::exists();

        return response()->json([
            'success'  => true,
            'has_data' => $hasData,
            'statuses' => $statuses,
            'cities'   => $cities,
            'packages' => $packages,
            'stos'     => $stos,
            'datels'   => $datels,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // DELETE /api/orders/clear
    // Hapus semua data order
    // ──────────────────────────────────────────────────────────────
    public function clear(): JsonResponse
    {
        Order::truncate();
        return response()->json(['success' => true, 'message' => 'Semua data order telah dihapus.']);
    }

    // ──────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────

    /**
     * Bangun mapping: kolom Excel (letter A, B, ...) → nama field DB
     */
    private function buildFieldIndex(array $headerRow): array
    {
        $index = [];
        foreach ($headerRow as $colLetter => $headerValue) {
            if ($headerValue === null) continue;
            $normalized = strtolower(trim((string) $headerValue));
            if (isset($this->columnMap[$normalized])) {
                $index[$colLetter] = $this->columnMap[$normalized];
            }
        }
        return $index;
    }

    /**
     * Cast nilai dari Excel ke tipe yang sesuai field DB
     */
    private function castValue(string $field, mixed $raw): mixed
    {
        if ($raw === null || $raw === '') return null;

        if ($field === 'order_date') {
            // PhpSpreadsheet bisa mengembalikan float (Excel date serial) atau string
            if (is_numeric($raw)) {
                try {
                    $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $raw);
                    return $date->format('Y-m-d');
                } catch (\Exception) {
                    return null;
                }
            }
            try {
                return Carbon::parse($raw)->format('Y-m-d');
            } catch (\Exception) {
                return null;
            }
        }

        return trim((string) $raw);
    }
}

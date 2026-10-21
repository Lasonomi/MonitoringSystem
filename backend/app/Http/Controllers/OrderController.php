<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\UploadReport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
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

        // ID pelanggan menggunakan ID order yang sama
        'customer id'     => 'customer_id',
        'customer_id'     => 'customer_id',
        'customerid'      => 'customer_id',
        'account_num'     => 'customer_id',
        'internet id'    => 'customer_id',
        'internet_id'    => 'customer_id',
        'cust id'         => 'customer_id',
        'cust_id'         => 'customer_id',
        'id pelanggan'    => 'customer_id',
        'id customer'     => 'customer_id',

        // sto
        'sto'             => 'sto',
        'csto'            => 'sto',

        // datel
        'datel'           => 'datel',

        // type_transaksi
        'type transaksi'  => 'type_transaksi',
        'type_transaksi'  => 'type_transaksi',
        'tipe transaksi'  => 'type_transaksi',
        'jenis transaksi' => 'type_transaksi',
        'transaksi'       => 'type_transaksi',
        'event_source_txt'=> 'type_transaksi',
        'channel 1'       => 'channel_1',

        // status
        'status'          => 'payment_status',
        'status resume'   => 'status',
        'trend'           => 'status',

        // payment amount
        'tagihan'         => 'amount',
        'nominal tagihan' => 'amount',
        'amount'          => 'amount',

        // order_date
        'order date'      => 'order_date',
        'order_date'      => 'order_date',
        'tgl ps'          => 'order_date',
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
        'alamat_pelanggan'=> 'cust_address',
        'alamat customer' => 'cust_address',
        'alamat'          => 'cust_address',
        'address'         => 'cust_address',
        'install address' => 'cust_address',

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
        'package name'    => 'package',
        'layanan'         => 'package',
        'product'         => 'package',
        'product_label'   => 'package',
        'produk'          => 'package',

        // jenis_layanan
        'jenis layanan'   => 'jenis_layanan',
        'jenis_layanan'   => 'jenis_layanan',
        'service type'    => 'jenis_layanan',
        'service_type'    => 'jenis_layanan',

        // speed_package
        'speed paket'     => 'speed_package',
        'speed package'   => 'speed_package',
        'kecepatan paket' => 'speed_package',
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

        $datelFilter = $request->validate([
            'datel_filter' => ['nullable', 'string', 'max:255'],
        ])['datel_filter'] ?? null;
        $datelColumn = array_search('datel', $fieldIndex, true);

        if ($datelFilter !== null && $datelColumn === false) {
            return response()->json([
                'success' => false,
                'message' => 'Filter wilayah dipilih, tetapi kolom DATEL tidak ditemukan di file.',
            ], 422);
        }

        $imported = 0;
        $createdOrders = 0;
        $updatedOrders = 0;
        $skipped  = 0;
        $filtered = 0;
        $identifiedCustomers = 0;
        $newCustomers = 0;
        $totalRevenue = 0.0;
        DB::transaction(function () use ($rows, $headerRow, $fieldIndex, $datelFilter, $datelColumn, $file, &$imported, &$createdOrders, &$updatedOrders, &$skipped, &$filtered, &$identifiedCustomers, &$newCustomers, &$totalRevenue): void {
            $batch = [];
            $seenCustomerIds = [];

            foreach ($rows as $row) {
                // Skip baris kosong
                $values = array_filter(array_values($row), fn($v) => $v !== null && $v !== '');
                if (empty($values)) {
                    $skipped++;
                    continue;
                }

                if ($datelFilter !== null) {
                    $rowDatel = trim((string) ($row[$datelColumn] ?? ''));
                    if (!$this->matchesDatel($rowDatel, $datelFilter)) {
                        $skipped++;
                        $filtered++;
                        continue;
                    }
                }

                $record = [];
                $preferredCustomerAddress = null;
                foreach ($fieldIndex as $colLetter => $dbField) {
                    $raw = $row[$colLetter] ?? null;
                    $value = $this->castValue($dbField, $raw);
                    $record[$dbField] = $value;

                    if (
                        $dbField === 'cust_address'
                        && strtolower(trim((string) ($headerRow[$colLetter] ?? ''))) === 'alamat_pelanggan'
                        && $this->hasValue($value)
                    ) {
                        $preferredCustomerAddress = $value;
                    }
                }
                if ($preferredCustomerAddress !== null) {
                    $record['cust_address'] = $preferredCustomerAddress;
                }

                if (!$this->hasValue($record['order_id'] ?? null) && $this->hasValue($record['customer_id'] ?? null)) {
                    $record['order_id'] = $record['customer_id'];
                }

                if ($this->hasValue($record['channel_1'] ?? null)) {
                    $record['type_transaksi'] = $record['channel_1'];
                }

                if (!$this->hasValue($record['order_id'] ?? null)) {
                    $skipped++;
                    continue;
                }

                $customerId = trim((string) ($record['customer_id'] ?? ''));
                if ($customerId !== '' && !isset($seenCustomerIds[$customerId])) {
                    $seenCustomerIds[$customerId] = true;
                    if (!Order::query()->where(function ($query) use ($customerId) {
                        $query->where('customer_id', $customerId)
                            ->orWhere('order_id', $customerId);
                    })->exists()) {
                        $newCustomers++;
                    }
                }

                $totalRevenue += (float) ($record['amount'] ?? 0);
                $now = now()->toDateTimeString();
                $record['created_at'] = $now;
                $record['updated_at'] = $now;

                $batch[] = $record;
                $imported++;

                // Batch insert setiap 500 baris
                if (count($batch) >= 500) {
                    $counts = $this->persistImportBatch($batch);
                    $createdOrders += $counts['created'];
                    $updatedOrders += $counts['updated'];
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                $counts = $this->persistImportBatch($batch);
                $createdOrders += $counts['created'];
                $updatedOrders += $counts['updated'];
            }

            $identifiedCustomers = count($seenCustomerIds);
            UploadReport::create([
                'file_name' => $file->getClientOriginalName(),
                'imported_orders' => $imported,
                'identified_customers' => $identifiedCustomers,
                'new_customers' => $newCustomers,
                'total_revenue' => $totalRevenue,
            ]);
        });

        return response()->json([
            'success'  => true,
            'message'  => "Berhasil mengimport {$imported} data order.",
            'imported' => $imported,
            'created' => $createdOrders,
            'updated' => $updatedOrders,
            'skipped'  => $skipped,
            'filtered' => $filtered,
            'identified_customers' => $identifiedCustomers,
            'new_customers' => $newCustomers,
            'total_revenue' => $totalRevenue,
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
                  ->orWhere('customer_id', 'like', "%{$search}%")
                  ->orWhere('cust_name','like', "%{$search}%")
                  ->orWhere('package',  'like', "%{$search}%")
                  ->orWhere('jenis_layanan', 'like', "%{$search}%")
                  ->orWhere('speed_package', 'like', "%{$search}%")
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
        if ($paymentStatus = $request->query('payment_status')) {
            $query->where('payment_status', $paymentStatus);
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
        $allTotalOrders = Order::query()->count();
        $allPayableOrders = Order::query()
            ->whereNotNull('payment_status')
            ->whereRaw('LOWER(TRIM(payment_status)) = ?', ['payable'])
            ->count();
        $totalRevenue = (clone $query)->sum('amount');
        $amountOrders = (clone $query)->whereNotNull('amount')->count();
        $paymentStatusOrders = (clone $query)->whereNotNull('payment_status')->count();
        $paidOrders = (clone $query)
            ->whereNotNull('payment_status')
            ->whereRaw('LOWER(TRIM(payment_status)) = ?', ['payable'])
            ->count();
        $unpaidOrders = (clone $query)
            ->whereNotNull('payment_status')
            ->whereIn(DB::raw('LOWER(TRIM(payment_status))'), [
                'nonpayable',
                'non payable',
                'belum bayar',
            ])
            ->count();
        $totalCustomers = (clone $query)
            ->selectRaw("COUNT(DISTINCT NULLIF(customer_id, '')) as aggregate")
            ->value('aggregate');
        $identifiedCustomerOrders = (clone $query)->whereNotNull('customer_id')->where('customer_id', '!=', '')->count();
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
            ->selectRaw("COALESCE(NULLIF(package, ''), NULLIF(speed_package, '')) as package, COUNT(*) as count")
            ->groupByRaw("COALESCE(NULLIF(package, ''), NULLIF(speed_package, ''))")
            ->orderByDesc('count')
            ->get();

        $byServiceType = (clone $query)
            ->selectRaw('jenis_layanan, COUNT(*) as count')
            ->whereNotNull('jenis_layanan')
            ->where('jenis_layanan', '!=', '')
            ->groupBy('jenis_layanan')
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
            'all_total_orders'  => $allTotalOrders,
            'all_payable_orders' => $allPayableOrders,
            'total_revenue'     => (float) $totalRevenue,
            'amount_orders'     => $amountOrders,
            'payment_status_orders' => $paymentStatusOrders,
            'paid_orders'       => $paidOrders,
            'unpaid_orders'     => $unpaidOrders,
            'total_customers'   => (int) $totalCustomers,
            'identified_customer_orders' => $identifiedCustomerOrders,
            'by_status'         => $byStatus,
            'by_city'           => $byCity,
            'by_package'        => $byPackage,
            'by_service_type'   => $byServiceType,
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
        $paymentStatuses = Order::query()->whereNotNull('payment_status')->distinct()->orderBy('payment_status')->pluck('payment_status')->filter()->values();
        $cities    = Order::distinct()->orderBy('city_name')->pluck('city_name')->filter()->values();
        $packages  = Order::query()
            ->selectRaw("DISTINCT COALESCE(NULLIF(package, ''), NULLIF(speed_package, '')) as package")
            ->orderBy('package')
            ->pluck('package')
            ->filter()
            ->values();
        $serviceTypes = Order::query()
            ->whereNotNull('jenis_layanan')
            ->where('jenis_layanan', '!=', '')
            ->distinct()
            ->orderBy('jenis_layanan')
            ->pluck('jenis_layanan')
            ->values();
        $stos      = Order::distinct()->orderBy('sto')->pluck('sto')->filter()->values();
        $datels    = Order::distinct()->orderBy('datel')->pluck('datel')->filter()->values();
        $hasData   = Order::exists();
        $minOrderDate = Order::query()->whereNotNull('order_date')->min('order_date');
        $minOrderDate = $minOrderDate ? Carbon::parse($minOrderDate)->toDateString() : null;

        return response()->json([
            'success'  => true,
            'has_data' => $hasData,
            'total_orders' => Order::count(),
            'min_order_date' => $minOrderDate,
            'statuses' => $statuses,
            'payment_statuses' => $paymentStatuses,
            'cities'   => $cities,
            'packages' => $packages,
            'service_types' => $serviceTypes,
            'stos'     => $stos,
            'datels'   => $datels,
        ]);
    }

    public function reportSummary(): JsonResponse
    {
        $latest = UploadReport::query()->latest('id')->first();
        $previous = UploadReport::query()->latest('id')->skip(1)->first();

        $growth = null;
        if ($latest && $previous && (float) $previous->total_revenue !== 0.0) {
            $growth = (((float) $latest->total_revenue - (float) $previous->total_revenue) / (float) $previous->total_revenue) * 100;
        }

        return response()->json([
            'success' => true,
            'latest' => $latest,
            'previous' => $previous,
            'growth_percent' => $growth,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // DELETE /api/orders/clear
    // Hapus semua data order
    // ──────────────────────────────────────────────────────────────
    public function clear(): JsonResponse
    {
        DB::transaction(function (): void {
            Order::truncate();
            UploadReport::truncate();
        });
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

    private function persistImportBatch(array $batch): array
    {
        $orderIds = array_values(array_unique(array_column($batch, 'order_id')));
        $existingByOrderId = Order::query()
            ->whereIn('order_id', $orderIds)
            ->orderByDesc('id')
            ->get()
            ->groupBy('order_id')
            ->map(fn($orders) => $orders->first());

        $updatesById = [];
        $newByOrderId = [];

        foreach ($batch as $record) {
            $orderId = (string) $record['order_id'];
            $existing = $existingByOrderId->get($orderId);

            if ($existing) {
                $current = $updatesById[$existing->id] ?? $existing->getAttributes();
                foreach ($record as $field => $value) {
                    if (!in_array($field, ['id', 'created_at', 'updated_at'], true) && $this->hasValue($value)) {
                        $current[$field] = $value;
                    }
                }
                if (!$this->hasValue($current['city_name'] ?? null) && $this->hasValue($current['datel'] ?? null)) {
                    $current['city_name'] = $current['datel'];
                }
                if ($this->hasValue($current['channel_1'] ?? null)) {
                    $current['type_transaksi'] = $current['channel_1'];
                }
                $current['updated_at'] = $record['updated_at'];
                $updatesById[$existing->id] = $current;
                continue;
            }

            $current = $newByOrderId[$orderId] ?? $record;
            if (isset($newByOrderId[$orderId])) {
                foreach ($record as $field => $value) {
                    if (!in_array($field, ['id', 'created_at', 'updated_at'], true) && $this->hasValue($value)) {
                        $current[$field] = $value;
                    }
                }
                $current['updated_at'] = $record['updated_at'];
            }
            if (!$this->hasValue($current['city_name'] ?? null) && $this->hasValue($current['datel'] ?? null)) {
                $current['city_name'] = $current['datel'];
            }
            if ($this->hasValue($current['channel_1'] ?? null)) {
                $current['type_transaksi'] = $current['channel_1'];
            }
            $newByOrderId[$orderId] = $current;
        }

        if ($updatesById !== []) {
            Order::upsert(
                array_values($updatesById),
                ['id'],
                ['order_id', 'customer_id', 'sto', 'datel', 'type_transaksi', 'channel_1', 'status', 'payment_status', 'amount', 'order_date', 'cust_name', 'cust_address', 'city_name', 'package', 'jenis_layanan', 'speed_package', 'updated_at']
            );
        }

        if ($newByOrderId !== []) {
            Order::insert(array_values($newByOrderId));
        }

        return [
            'created' => count($newByOrderId),
            'updated' => count($updatesById),
        ];
    }

    private function matchesDatel(string $datel, string $filter): bool
    {
        $parts = preg_split('/[\/,|]+/', mb_strtoupper($datel)) ?: [];
        $parts = array_map('trim', $parts);

        return in_array(mb_strtoupper(trim($filter)), $parts, true);
    }

    private function hasValue(mixed $value): bool
    {
        return $value !== null && trim((string) $value) !== '';
    }

    /**
     * Cast nilai dari Excel ke tipe yang sesuai field DB
     */
    private function castValue(string $field, mixed $raw): mixed
    {
        if ($raw === null || $raw === '') return null;

        if ($field === 'amount') {
            return $this->parseAmount($raw);
        }

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

    private function parseAmount(mixed $raw): ?float
    {
        if (is_numeric($raw)) {
            return round((float) $raw, 2);
        }

        $value = preg_replace('/[^\d,.\-]/u', '', trim((string) $raw));
        if ($value === null || $value === '' || !preg_match('/\d/', $value)) {
            return null;
        }

        $comma = strrpos($value, ',');
        $dot = strrpos($value, '.');
        if ($comma !== false && $dot !== false) {
            $decimalSeparator = $comma > $dot ? ',' : '.';
            $thousandsSeparator = $decimalSeparator === ',' ? '.' : ',';
            $value = str_replace($thousandsSeparator, '', $value);
            $value = str_replace($decimalSeparator, '.', $value);
        } elseif ($comma !== false || $dot !== false) {
            $separator = $comma !== false ? ',' : '.';
            $lastSeparator = strrpos($value, $separator);
            $decimalDigits = strlen($value) - $lastSeparator - 1;
            if ($decimalDigits === 1 || $decimalDigits === 2) {
                $value = str_replace($separator, '.', $value);
            } else {
                $value = str_replace($separator, '', $value);
            }
        }

        return is_numeric($value) ? round((float) $value, 2) : null;
    }
}

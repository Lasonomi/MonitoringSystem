<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class OrderUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_upload_adds_orders_without_deleting_existing_orders(): void
    {
        Order::create([
            'order_id' => 'OLD-ORDER',
            'cust_name' => 'Pelanggan Lama',
        ]);

        $file = UploadedFile::fake()->createWithContent(
            'orders.csv',
            "ORDER ID,CUST NAME\nNEW-ORDER,Pelanggan Baru\n"
        );

        $response = $this->postJson('/api/orders/upload', ['file' => $file]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('imported', 1);

        $this->assertDatabaseHas('orders', [
            'order_id' => 'OLD-ORDER',
            'cust_name' => 'Pelanggan Lama',
        ]);
        $this->assertDatabaseHas('orders', [
            'order_id' => 'NEW-ORDER',
            'cust_name' => 'Pelanggan Baru',
        ]);
    }

    public function test_upload_maps_account_num_to_customer_id(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'customers.csv',
            "ORDER ID,ACCOUNT_NUM\nORDER-ACCOUNT-1,ACCOUNT-123\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $file])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('imported', 1);

        $this->assertDatabaseHas('orders', [
            'order_id' => 'ORDER-ACCOUNT-1',
            'customer_id' => 'ACCOUNT-123',
        ]);
    }

    public function test_upload_counts_only_customer_ids_not_seen_in_existing_orders_as_new(): void
    {
        Order::create([
            'order_id' => 'OLD-ORDER',
            'customer_id' => 'EXISTING-CUSTOMER',
        ]);

        $file = UploadedFile::fake()->createWithContent(
            'customers.csv',
            "ORDER ID,INTERNET ID\nNEW-ORDER-1,NEW-CUSTOMER\nOLD-ORDER-2,EXISTING-CUSTOMER\nNEW-ORDER-3,NEW-CUSTOMER\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $file])
            ->assertOk()
            ->assertJsonPath('imported', 3)
            ->assertJsonPath('new_customers', 1);

        $this->assertDatabaseHas('orders', [
            'order_id' => 'NEW-ORDER-1',
            'customer_id' => 'NEW-CUSTOMER',
        ]);
    }

    public function test_payment_cards_classify_payable_and_nonpayable_statuses_without_overlap(): void
    {
        foreach (['PAYABLE', ' PAYABLE ', 'NONPAYABLE', 'NON PAYABLE', 'BELUM BAYAR', 'OTHER', 'Sudah Bayar'] as $index => $status) {
            Order::create([
                'order_id' => "PAYMENT-STATUS-{$index}",
                'payment_status' => $status,
            ]);
        }

        $this->getJson('/api/orders/stats')
            ->assertOk()
            ->assertJsonPath('total_orders', 7)
            ->assertJsonPath('all_total_orders', 7)
            ->assertJsonPath('all_payable_orders', 2)
            ->assertJsonPath('paid_orders', 2)
            ->assertJsonPath('unpaid_orders', 3);

        $this->getJson('/api/orders/stats?start_date=2026-01-01')
            ->assertOk()
            ->assertJsonPath('total_orders', 0)
            ->assertJsonPath('all_total_orders', 7)
            ->assertJsonPath('all_payable_orders', 2);
    }

    public function test_upload_reports_existing_orders_as_updated_not_created(): void
    {
        Order::create([
            'order_id' => 'EXISTING-ORDER',
            'cust_name' => 'Nama Lama',
        ]);

        $file = UploadedFile::fake()->createWithContent(
            'orders.csv',
            "ORDER ID,CUST NAME\nEXISTING-ORDER,Nama Baru\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $file])
            ->assertOk()
            ->assertJsonPath('imported', 1)
            ->assertJsonPath('created', 0)
            ->assertJsonPath('updated', 1);

        $this->assertSame(1, Order::where('order_id', 'EXISTING-ORDER')->count());
        $this->assertDatabaseHas('orders', [
            'order_id' => 'EXISTING-ORDER',
            'cust_name' => 'Nama Baru',
        ]);
    }

    public function test_upload_maps_source_report_column_aliases(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'customers.csv',
            "ORDER ID,ACCOUNT_NUM,CSTO,DATEL,EVENT_SOURCE_TXT,STATUS,TREND,TAGIHAN,NAMA,ALAMAT_PELANGGAN,ALAMAT,KOTA,PRODUCT_LABEL\n"
            . "ORDER-ALIASES,ACCOUNT-123,CSTO-1,PII / LUMAJANG,Campaign,Active,In Progress,125000,Customer Name,Preferred Address,Other Address,Lumajang,Internet Package\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $file])
            ->assertOk()
            ->assertJsonPath('imported', 1);

        $this->assertDatabaseHas('orders', [
            'order_id' => 'ORDER-ALIASES',
            'customer_id' => 'ACCOUNT-123',
            'sto' => 'CSTO-1',
            'datel' => 'PII / LUMAJANG',
            'type_transaksi' => 'Campaign',
            'payment_status' => 'Active',
            'status' => 'In Progress',
            'amount' => 125000,
            'cust_name' => 'Customer Name',
            'cust_address' => 'Preferred Address',
            'city_name' => 'Lumajang',
            'package' => 'Internet Package',
        ]);
    }

    public function test_customer_address_falls_back_to_alamat_when_preferred_address_is_empty(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'customers.csv',
            "ORDER ID,ALAMAT_PELANGGAN,ALAMAT\nORDER-ADDRESS-FALLBACK,,Fallback Address\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $file])
            ->assertOk()
            ->assertJsonPath('imported', 1);

        $this->assertDatabaseHas('orders', [
            'order_id' => 'ORDER-ADDRESS-FALLBACK',
            'cust_address' => 'Fallback Address',
        ]);
    }

    public function test_upload_can_filter_rows_by_datel_without_importing_other_regions(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'orders.csv',
            "ORDER ID,DATEL\nLUM-ORDER,PII / LUMAJANG\nSIT-ORDER,Situbondo\n"
        );

        $response = $this->postJson('/api/orders/upload', [
            'file' => $file,
            'datel_filter' => 'Lumajang',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('imported', 1)
            ->assertJsonPath('filtered', 1);

        $this->assertDatabaseHas('orders', ['order_id' => 'LUM-ORDER']);
        $this->assertDatabaseMissing('orders', ['order_id' => 'SIT-ORDER']);
    }

    public function test_upload_maps_and_merges_data_by_order_id(): void
    {
        $existing = Order::create([
            'order_id' => 'SYNC-ORDER',
            'status' => 'Completed (PS)',
            'city_name' => 'PASIRIAN',
        ]);

        $referenceFile = UploadedFile::fake()->createWithContent(
            'reference.csv',
            "ORDER ID,TGL PS,DATEL,STO,NAMA,Speed Paket,CHANNEL 1\nSYNC-ORDER,2026-10-01,PII / LUMAJANG,PII,Nama Pelanggan,100 Mbps,Sales Force DBS\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $referenceFile])
            ->assertOk()
            ->assertJsonPath('imported', 1);

        $this->assertSame(1, Order::where('order_id', 'SYNC-ORDER')->count());
        $existing->refresh();
        $this->assertSame('Completed (PS)', $existing->status);
        $this->assertSame('PASIRIAN', $existing->city_name);
        $this->assertSame('100 Mbps', $existing->speed_package);
        $this->assertSame('Sales Force DBS', $existing->type_transaksi);
        $this->assertSame('Sales Force DBS', $existing->channel_1);
        $this->assertSame('2026-10-01', $existing->order_date->format('Y-m-d'));

        $reportFile = UploadedFile::fake()->createWithContent(
            'report.csv',
            "ORDER ID,STATUS RESUME,PACKAGE NAME,CITY NAME\nSYNC-ORDER,Completed (PS),Indibiz 100 Mbps,PASIRIAN\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $reportFile])
            ->assertOk()
            ->assertJsonPath('imported', 1);

        $existing->refresh();
        $this->assertSame(1, Order::where('order_id', 'SYNC-ORDER')->count());
        $this->assertSame('Completed (PS)', $existing->status);
        $this->assertSame('Indibiz 100 Mbps', $existing->package);
        $this->assertSame('100 Mbps', $existing->speed_package);
        $this->assertSame('Sales Force DBS', $existing->type_transaksi);
    }

    public function test_city_falls_back_to_datel_when_city_name_is_missing(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'orders.csv',
            "ORDER ID,DATEL\nCITY-FALLBACK,PII / LUMAJANG\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $file])
            ->assertOk();

        $this->assertDatabaseHas('orders', [
            'order_id' => 'CITY-FALLBACK',
            'city_name' => 'PII / LUMAJANG',
        ]);
    }

    public function test_speed_package_is_available_in_package_statistics_and_filters(): void
    {
        Order::create([
            'order_id' => 'SPEED-ORDER',
            'speed_package' => '100 Mbps',
        ]);

        $this->getJson('/api/orders/stats')
            ->assertOk()
            ->assertJsonPath('by_package.0.package', '100 Mbps')
            ->assertJsonPath('by_package.0.count', 1);

        $this->getJson('/api/orders/meta')
            ->assertOk()
            ->assertJsonPath('packages.0', '100 Mbps');
    }

    public function test_jenis_layanan_is_imported_and_used_for_service_type_statistics(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'orders.csv',
            "ORDER ID,JENIS LAYANAN,PACKAGE NAME\nSERVICE-ORDER,Fiber Internet,IndiBiz Enterprise 100 Mbps\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $file])
            ->assertOk()
            ->assertJsonPath('imported', 1);

        $this->assertDatabaseHas('orders', [
            'order_id' => 'SERVICE-ORDER',
            'jenis_layanan' => 'Fiber Internet',
            'package' => 'IndiBiz Enterprise 100 Mbps',
        ]);

        $this->getJson('/api/orders/stats')
            ->assertOk()
            ->assertJsonPath('by_service_type.0.jenis_layanan', 'Fiber Internet')
            ->assertJsonPath('by_service_type.0.count', 1);

        $this->getJson('/api/orders/meta')
            ->assertOk()
            ->assertJsonPath('service_types.0', 'Fiber Internet');
    }

    public function test_meta_returns_the_earliest_order_date(): void
    {
        Order::create(['order_id' => 'LATER-ORDER', 'order_date' => '2026-10-10']);
        Order::create(['order_id' => 'EARLIER-ORDER', 'order_date' => '2026-09-02']);

        $this->getJson('/api/orders/meta')
            ->assertOk()
            ->assertJsonPath('total_orders', 2)
            ->assertJsonPath('min_order_date', '2026-09-02');
    }

    public function test_customer_search_matches_name_datel_sto_and_customer_id(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'customers.csv',
            "ID PELANGGAN,NAMA PELANGGAN,DATEL,STO\nCUST-1234,Siti Pelanggan,LUMAJANG,LMJ01\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $file])
            ->assertOk()
            ->assertJsonPath('imported', 1);

        foreach (['Siti Pelanggan', 'LUMAJANG', 'LMJ01', 'CUST-1234'] as $search) {
            $this->getJson('/api/orders?search=' . urlencode($search))
                ->assertOk()
                ->assertJsonPath('meta.total', 1)
                ->assertJsonPath('data.0.order_id', 'CUST-1234');
        }
    }

    public function test_datel_filter_requires_a_datel_column(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'orders.csv',
            "ORDER ID,CUST NAME\nNEW-ORDER,Pelanggan Baru\n"
        );

        $this->postJson('/api/orders/upload', [
            'file' => $file,
            'datel_filter' => 'Lumajang',
        ])->assertUnprocessable()
            ->assertJsonPath('message', 'Filter wilayah dipilih, tetapi kolom DATEL tidak ditemukan di file.');
    }

    public function test_payment_customer_and_upload_report_metrics_are_tracked(): void
    {
        $firstReport = UploadedFile::fake()->createWithContent(
            'report-one.csv',
            "ORDER ID,CUSTOMER ID,TAGIHAN,STATUS\nORDER-1,CUSTOMER-1,\"Rp 1.000.000\",Sudah Bayar\nORDER-2,CUSTOMER-2,250000,PAYABLE\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $firstReport])
            ->assertOk()
            ->assertJsonPath('new_customers', 2)
            ->assertJsonPath('total_revenue', 1250000);

        $secondReport = UploadedFile::fake()->createWithContent(
            'report-two.csv',
            "ORDER ID,CUSTOMER ID,TAGIHAN,STATUS\nORDER-3,CUSTOMER-1,100000,Lunas\nORDER-4,CUSTOMER-3,500000,PAYABLE\n"
        );

        $this->postJson('/api/orders/upload', ['file' => $secondReport])
            ->assertOk()
            ->assertJsonPath('new_customers', 1)
            ->assertJsonPath('total_revenue', 600000);

        $this->getJson('/api/orders/stats')
            ->assertOk()
            ->assertJsonPath('total_revenue', 1850000)
            ->assertJsonPath('paid_orders', 2)
            ->assertJsonPath('unpaid_orders', 0)
            ->assertJsonPath('total_customers', 3);

        $this->getJson('/api/orders/reports/summary')
            ->assertOk()
            ->assertJsonPath('latest.file_name', 'report-two.csv')
            ->assertJsonPath('latest.new_customers', 1)
            ->assertJsonPath('previous.total_revenue', 1250000)
            ->assertJsonPath('growth_percent', -52);
    }
}

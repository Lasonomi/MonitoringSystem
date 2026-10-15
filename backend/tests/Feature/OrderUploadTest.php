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
}

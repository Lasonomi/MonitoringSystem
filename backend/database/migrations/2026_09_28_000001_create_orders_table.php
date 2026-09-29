<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabel ini menyimpan data order yang diimport dari file Excel.
     * Kolom sesuai header Excel: ORDER ID, STO, DATEL, TYPE TRANSAKSI,
     * STATUS, ORDER DATE, CUST NAME, CUST ADDRESS, CITY NAME, PACKAGE
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->nullable()->index();
            $table->string('sto')->nullable();
            $table->string('datel')->nullable();
            $table->string('type_transaksi')->nullable();
            $table->string('status')->nullable()->index();
            $table->date('order_date')->nullable()->index();
            $table->string('cust_name')->nullable();
            $table->text('cust_address')->nullable();
            $table->string('city_name')->nullable()->index();
            $table->string('package')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

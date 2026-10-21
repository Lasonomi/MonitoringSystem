<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_id')->nullable()->index();
            $table->decimal('amount', 15, 2)->nullable();
            $table->string('payment_status')->nullable()->index();
        });

        Schema::create('upload_reports', function (Blueprint $table) {
            $table->id();
            $table->string('file_name');
            $table->unsignedInteger('imported_orders')->default(0);
            $table->unsignedInteger('identified_customers')->default(0);
            $table->unsignedInteger('new_customers')->default(0);
            $table->decimal('total_revenue', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upload_reports');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['customer_id']);
            $table->dropIndex(['payment_status']);
            $table->dropColumn(['customer_id', 'amount', 'payment_status']);
        });
    }
};

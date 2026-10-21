<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_id',
        'customer_id',
        'sto',
        'datel',
        'type_transaksi',
        'channel_1',
        'status',
        'payment_status',
        'amount',
        'order_date',
        'cust_name',
        'cust_address',
        'city_name',
        'package',
        'jenis_layanan',
        'speed_package',
    ];

    protected $casts = [
        'order_date' => 'date',
        'amount' => 'decimal:2',
    ];
}

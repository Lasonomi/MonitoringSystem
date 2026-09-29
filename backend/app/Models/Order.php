<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_id',
        'sto',
        'datel',
        'type_transaksi',
        'status',
        'order_date',
        'cust_name',
        'cust_address',
        'city_name',
        'package',
    ];

    protected $casts = [
        'order_date' => 'date',
    ];
}

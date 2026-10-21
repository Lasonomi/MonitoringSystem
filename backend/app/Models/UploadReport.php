<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UploadReport extends Model
{
    protected $fillable = [
        'file_name',
        'imported_orders',
        'identified_customers',
        'new_customers',
        'total_revenue',
    ];
}

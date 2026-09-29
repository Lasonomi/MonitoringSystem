<?php

use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/ping', fn() => response()->json(['status' => 'ok', 'timestamp' => now()]));

// Order routes
Route::prefix('orders')->group(function () {
    // Upload Excel file → import ke DB
    Route::post('/upload', [OrderController::class, 'upload']);

    // Daftar order (dengan filter & pagination)
    Route::get('/', [OrderController::class, 'index']);

    // Statistik agregat untuk dashboard
    Route::get('/stats', [OrderController::class, 'stats']);

    // Metadata: nilai unik status, kota, paket, dll.
    Route::get('/meta', [OrderController::class, 'meta']);

    // Hapus semua data
    Route::delete('/clear', [OrderController::class, 'clear']);
});

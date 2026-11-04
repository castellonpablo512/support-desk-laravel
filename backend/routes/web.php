<?php

use App\Http\Controllers\SessionController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    Route::get('csrf-cookie', fn () => response()->noContent());

    Route::middleware(['guest', 'throttle:10,1'])->group(function () {
        Route::post('register', [SessionController::class, 'register']);
        Route::post('login', [SessionController::class, 'login']);
    });

    Route::middleware('auth')->group(function () {
        Route::get('user', [SessionController::class, 'show']);
        Route::post('logout', [SessionController::class, 'logout']);
    });
});

Route::get('/', function () {
    return view('welcome');
});

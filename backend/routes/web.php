<?php

use App\Http\Controllers\SessionController;
use App\Http\Controllers\TicketController;
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
        Route::get('tickets', [TicketController::class, 'index']);
        Route::get('support-users', [TicketController::class, 'supportUsers']);
        Route::post('tickets', [TicketController::class, 'store']);
        Route::get('tickets/{ticket}', [TicketController::class, 'show']);
        Route::patch('tickets/{ticket}', [TicketController::class, 'update']);
        Route::post('tickets/{ticket}/comments', [TicketController::class, 'comment']);
    });
});

Route::get('/', function () {
    return view('welcome');
});

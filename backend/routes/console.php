<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('support:grant {email}', function (string $email): int {
    $user = User::where('email', strtolower(trim($email)))->first();

    if ($user === null) {
        $this->error('No existe una cuenta con ese correo.');

        return 1;
    }

    $user->role = 'support';
    $user->save();
    $this->info('Cuenta habilitada para soporte.');

    return 0;
})->purpose('Grant support access to an existing account');

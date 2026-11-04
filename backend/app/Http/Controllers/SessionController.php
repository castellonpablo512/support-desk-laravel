<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $email = $request->input('email');
        if (is_string($email)) {
            $request->merge(['email' => strtolower($email)]);
        }
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:12', 'max:72', 'confirmed'],
        ]);

        if (strlen($data['password']) > 72) {
            throw ValidationException::withMessages(['password' => 'La contraseña supera el tamaño máximo permitido.']);
        }

        $user = User::create($data);
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $this->profile($user)], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:72'],
        ]);
        $data['email'] = strtolower($data['email']);

        if (strlen($data['password']) > 72 || ! Auth::attempt($data)) {
            throw ValidationException::withMessages(['email' => 'El correo o la contraseña no son válidos.']);
        }

        $request->session()->regenerate();

        return $this->show($request);
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->profile($request->user())]);
    }

    public function logout(Request $request): Response
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    /** @return array{id: int, name: string, email: string, role: string} */
    private function profile(User $user): array
    {
        return $user->only(['id', 'name', 'email', 'role']);
    }
}

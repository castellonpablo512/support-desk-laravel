<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_cannot_grant_support_access(): void
    {
        $password = 'a-long-test-password';

        $this->postJson('/api/register', [
            'name' => 'Requester',
            'email' => 'Requester@example.com',
            'password' => $password,
            'password_confirmation' => $password,
            'role' => 'support',
        ])->assertCreated()
            ->assertJsonPath('user.role', 'requester')
            ->assertJsonPath('user.email', 'requester@example.com')
            ->assertJsonMissingPath('user.password');

        $this->assertAuthenticated();
        $this->assertTrue(Hash::check($password, User::sole()->password));
    }

    public function test_support_access_can_be_granted_to_an_existing_account(): void
    {
        $user = User::factory()->create();

        $this->artisan('support:grant', ['email' => $user->email])->assertSuccessful();
        $this->assertTrue($user->refresh()->isSupport());
    }

    public function test_login_requires_valid_credentials_and_logout_revokes_the_session(): void
    {
        $user = User::factory()->create();
        $this->getJson('/api/user')->assertUnauthorized();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertUnprocessable();
        $this->assertGuest();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk()->assertJsonPath('user.id', $user->id);

        $this->getJson('/api/user')->assertOk()->assertJsonPath('user.id', $user->id);
        $this->postJson('/api/logout')->assertNoContent();
        $this->getJson('/api/user')->assertUnauthorized();
    }
}

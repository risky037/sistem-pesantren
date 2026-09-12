<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InactiveUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->inactive()->create([
            'password' => 'password',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['email' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.']);
    }

    public function test_active_user_can_login_normally(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route($user->roleEnum()->dashboardRouteName(), absolute: false));
    }

    public function test_inactive_user_mid_session_request_is_terminated(): void
    {
        $user = User::factory()->inactive()->create();

        // Simulate an existing active session hitting a protected route
        $response = $this->actingAs($user)->get('/profile');

        $this->assertGuest();
        $response->assertRedirect('/login');
        $response->assertSessionHasErrors(['email' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.']);
    }

    public function test_deactivated_admin_cannot_login(): void
    {
        $admin = User::factory()->inactive()->create([
            'role' => UserRole::Admin->value,
            'password' => 'password',
        ]);

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['email' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.']);
    }
}

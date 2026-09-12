<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_guest_cannot_access_ustadz_dashboard(): void
    {
        $response = $this->get(route('ustadz.dashboard'));

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_ustadz_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'ustadz',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('admin.dashboard'));

        $response->assertForbidden();
    }

    public function test_admin_cannot_access_ustadz_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('ustadz.dashboard'));

        $response->assertForbidden();
    }

    public function test_unknown_role_cannot_access_privileged_dashboards(): void
    {
        $user = User::factory()->create([
            'role' => 'unknown',
        ]);

        $this
            ->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertForbidden();

        $this
            ->actingAs($user)
            ->get(route('ustadz.dashboard'))
            ->assertForbidden();
    }
}

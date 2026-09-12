<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Santri;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SantriLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
        $this->admin->role = UserRole::Admin->value;
        $this->admin->save();
    }

    public function test_admin_can_provision_santri_and_linked_user(): void
    {
        $payload = [
            'nis' => '12345',
            'nama' => 'Test Santri',
            'jenis_kelamin' => 'L',
            'kelas' => 'X-A',
            'status' => 'aktif',
            'email' => 'santri@example.com',
            'password' => 'password123',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.santri.store'), $payload);

        $response->assertRedirect(route('admin.santri.index'));
        $response->assertSessionHas('success');

        // Verify User was created
        $this->assertDatabaseHas('users', [
            'email' => 'santri@example.com',
            'name' => 'Test Santri',
            'role' => UserRole::Santri->value,
            'is_active' => 1,
        ]);

        $user = User::where('email', 'santri@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));

        // Verify Santri was created and linked
        $this->assertDatabaseHas('santris', [
            'user_id' => $user->id,
            'nis' => '12345',
            'nama' => 'Test Santri',
            'kelas' => 'X-A',
        ]);
    }

    public function test_admin_can_update_santri_and_user_credentials(): void
    {
        $santri = Santri::factory()->create();

        $payload = [
            'nis' => $santri->nis,
            'nama' => 'Updated Name',
            'jenis_kelamin' => $santri->jenis_kelamin,
            'kelas' => $santri->kelas,
            'status' => $santri->status,
            'email' => 'updated@example.com',
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.santri.update', $santri->id), $payload);

        $response->assertRedirect(route('admin.santri.index'));

        // Verify Santri updated
        $this->assertDatabaseHas('santris', [
            'id' => $santri->id,
            'nama' => 'Updated Name',
        ]);

        // Verify User updated
        $this->assertDatabaseHas('users', [
            'id' => $santri->user_id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_admin_can_reset_santri_password(): void
    {
        $santri = Santri::factory()->create();

        $payload = [
            'password' => 'SecurePa$$w0rd2026!',
            'password_confirmation' => 'SecurePa$$w0rd2026!',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.santri.reset-password', $santri->id), $payload);

        $response->assertRedirect(route('admin.santri.index'));

        $user = $santri->user->fresh();
        $this->assertTrue(Hash::check('SecurePa$$w0rd2026!', $user->password));
    }

    public function test_non_admin_cannot_reset_santri_password(): void
    {
        $santri = Santri::factory()->create();
        $ustadz = User::factory()->create(['role' => UserRole::Ustadz->value]);

        $payload = [
            'password' => 'SecurePa$$w0rd2026!',
            'password_confirmation' => 'SecurePa$$w0rd2026!',
        ];

        $this->actingAs($ustadz)->post(route('admin.santri.reset-password', $santri->id), $payload)
            ->assertStatus(403);
    }

    public function test_admin_can_delete_santri_and_linked_user_is_removed(): void
    {
        $santri = Santri::factory()->create();
        $userId = $santri->user_id;

        $response = $this->actingAs($this->admin)->delete(route('admin.santri.destroy', $santri->id));

        $response->assertRedirect(route('admin.santri.index'));

        $this->assertDatabaseMissing('santris', ['id' => $santri->id]);
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_santri_cannot_access_ustadz_or_admin_dashboard(): void
    {
        $santri = Santri::factory()->create();
        $user = $santri->user;

        $this->actingAs($user)->get(route('admin.dashboard'))->assertStatus(403);
        $this->actingAs($user)->get(route('ustadz.dashboard'))->assertStatus(403);
    }
}

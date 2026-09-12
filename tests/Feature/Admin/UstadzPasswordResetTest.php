<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Security boundary tests for Admin-managed Ustadz credential reset.
 *
 * P0-1B.2b: Self-service password reset has been removed. Credential reset
 * is an exclusively Admin-managed operation. These tests verify the
 * authorization boundary and correctness of the reset action.
 */
class UstadzPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_reset_ustadz_password(): void
    {
        $admin = User::factory()->admin()->create();
        $ustadz = User::factory()->ustadz()->create();

        $newPassword = 'new-secure-password-99';

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.ustadz.reset-password', $ustadz->id), [
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ]);

        $response->assertRedirect(route('admin.ustadz.index'));
        $response->assertSessionHas('success');

        // Confirm the new password hash is stored and is correct
        $this->assertTrue(Hash::check($newPassword, $ustadz->fresh()->password));
    }

    public function test_admin_cannot_reset_password_with_unconfirmed_password(): void
    {
        $admin = User::factory()->admin()->create();
        $ustadz = User::factory()->ustadz()->create();

        $originalHash = $ustadz->password;

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.ustadz.reset-password', $ustadz->id), [
                'password' => 'new-password-123',
                'password_confirmation' => 'different-password-456',
            ]);

        $response->assertSessionHasErrors(['password']);

        // Password must be unchanged
        $this->assertSame($originalHash, $ustadz->fresh()->password);
    }

    public function test_admin_cannot_reset_password_shorter_than_minimum(): void
    {
        $admin = User::factory()->admin()->create();
        $ustadz = User::factory()->ustadz()->create();

        $originalHash = $ustadz->password;

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.ustadz.reset-password', $ustadz->id), [
                'password' => 'short',
                'password_confirmation' => 'short',
            ]);

        $response->assertSessionHasErrors(['password']);
        $this->assertSame($originalHash, $ustadz->fresh()->password);
    }

    public function test_admin_cannot_reset_password_for_non_ustadz_user(): void
    {
        $admin = User::factory()->admin()->create();
        $anotherAdmin = User::factory()->admin()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.ustadz.reset-password', $anotherAdmin->id), [
                'password' => 'new-secure-password-99',
                'password_confirmation' => 'new-secure-password-99',
            ]);

        // Route is scoped to ustadz role — admin users return 404
        $response->assertStatus(404);
    }

    public function test_ustadz_cannot_reset_another_users_password(): void
    {
        $ustadz = User::factory()->ustadz()->create();
        $targetUstadz = User::factory()->ustadz()->create();

        $response = $this
            ->actingAs($ustadz)
            ->post(route('admin.ustadz.reset-password', $targetUstadz->id), [
                'password' => 'new-secure-password-99',
                'password_confirmation' => 'new-secure-password-99',
            ]);

        // Blocked by role:admin middleware
        $response->assertForbidden();
    }

    public function test_guest_cannot_reset_ustadz_password(): void
    {
        $ustadz = User::factory()->ustadz()->create();

        $response = $this->post(route('admin.ustadz.reset-password', $ustadz->id), [
            'password' => 'new-secure-password-99',
            'password_confirmation' => 'new-secure-password-99',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_plaintext_password_is_never_stored(): void
    {
        $admin = User::factory()->admin()->create();
        $ustadz = User::factory()->ustadz()->create();

        $plaintext = 'plaintext-credential-99';

        $this
            ->actingAs($admin)
            ->post(route('admin.ustadz.reset-password', $ustadz->id), [
                'password' => $plaintext,
                'password_confirmation' => $plaintext,
            ]);

        // The stored value must NOT equal the plaintext
        $this->assertNotSame($plaintext, $ustadz->fresh()->password);
        // And it must be a valid bcrypt/argon hash of the plaintext
        $this->assertTrue(Hash::check($plaintext, $ustadz->fresh()->password));
    }
}

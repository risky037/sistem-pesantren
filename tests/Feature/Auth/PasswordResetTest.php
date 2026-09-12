<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Password reset route contract tests.
 *
 * P0-1B.2b: Self-service password reset has been intentionally removed.
 * Accounts are Admin-provisioned; credential recovery is an Admin operation.
 * These tests assert that all self-service reset surfaces return 404.
 *
 * The previous tests in this file asserted that reset routes returned 200
 * and that reset notifications were dispatched. Those behaviours no longer
 * exist. This file now serves as the permanent contract test for the
 * removed self-service surface.
 */
class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_screen_is_unavailable(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(404);
    }

    public function test_reset_password_link_cannot_be_requested(): void
    {
        $response = $this->post('/forgot-password', [
            'email' => 'any@example.com',
        ]);

        $response->assertStatus(404);
    }

    public function test_reset_password_screen_is_unavailable(): void
    {
        $response = $this->get('/reset-password/any-token-value');

        $response->assertStatus(404);
    }

    public function test_password_cannot_be_reset_via_token(): void
    {
        $response = $this->post('/reset-password', [
            'token' => 'any-token-value',
            'email' => 'any@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertStatus(404);
    }
}

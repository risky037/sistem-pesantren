<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertStatus(200);
    }

    public function test_email_can_be_verified(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('ustadz.dashboard', absolute: false).'?verified=1');
    }

    public function test_admin_email_can_be_verified(): void
    {
        $admin = User::factory()->admin()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $admin->id, 'hash' => sha1($admin->email)]
        );

        $response = $this->actingAs($admin)->get($verificationUrl);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($admin->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('admin.dashboard', absolute: false).'?verified=1');
    }

    public function test_email_is_not_verified_with_invalid_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong-email')]
        );

        $this->actingAs($user)->get($verificationUrl);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_verified_ustadz_sending_verification_notification_redirects_to_ustadz_dashboard(): void
    {
        $user = User::factory()->ustadz()->create();

        $response = $this->actingAs($user)->post('/email/verification-notification');

        $response->assertRedirect(route('ustadz.dashboard', absolute: false));
    }

    public function test_verified_admin_sending_verification_notification_redirects_to_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/email/verification-notification');

        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }

    public function test_verified_santri_sending_verification_notification_fails_closed(): void
    {
        $santri = User::factory()->santri()->create();

        $response = $this->actingAs($santri)->post('/email/verification-notification');

        $response->assertForbidden();
    }
}

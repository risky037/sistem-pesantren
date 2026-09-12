<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();
        $destination = $user->roleEnum()?->dashboardRouteName();

        if ($destination === null) {
            abort(403, 'Akses dashboard belum tersedia untuk akun ini.');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route($destination, absolute: false).'?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->intended(route($destination, absolute: false).'?verified=1');
    }
}

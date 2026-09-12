<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        if ($request->user()->hasVerifiedEmail()) {
            $destination = $request->user()->roleEnum()?->dashboardRouteName();

            if ($destination === null) {
                abort(403, 'Akses dashboard belum tersedia untuk akun ini.');
            }

            return redirect()->intended(route($destination, absolute: false));
        }

        return Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }
}

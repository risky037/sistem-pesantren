<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! Auth::check()) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        $userRole = Auth::user()->roleEnum();
        $targetRole = UserRole::tryFrom($role);

        if ($userRole === null || $targetRole === null || $userRole !== $targetRole) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}

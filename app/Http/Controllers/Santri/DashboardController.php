<?php

namespace App\Http\Controllers\Santri;

use App\Http\Controllers\Controller;
use App\Models\Santri;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        Gate::authorize('viewDashboard', Santri::class);

        return Inertia::render('Santri/Dashboard', [
            'santri' => request()->user()->santri,
        ]);
    }
}

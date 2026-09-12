<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalSantri' => Santri::count(),
                'totalUstadz' => User::where('role', UserRole::Ustadz->value)->count(),
                'totalMapel' => Subject::count(),
                'totalJadwal' => Jadwal::count(),
            ],
            'recentSantri' => Santri::latest()->take(5)->get(),
        ]);
    }
}

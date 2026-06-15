<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\Jadwal;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalSantri' => Santri::count(),
                'totalUstadz' => User::where('role', 'ustadz')->count(),
                'totalMapel' => Subject::count(),
                'totalJadwal' => Jadwal::count(),
            ],
            'recentSantri' => Santri::latest()->take(5)->get(),
        ]);
    }
}

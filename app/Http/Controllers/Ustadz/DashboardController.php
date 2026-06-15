<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Santri;
use App\Models\Materi;
use App\Models\Penilaian;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        return Inertia::render('Ustadz/Dashboard', [
            'stats' => [
                'totalKelas' => Jadwal::where('user_id', $userId)->distinct('kelas')->count('kelas'),
                'totalSantri' => Santri::count(),
                'totalMateri' => Materi::where('user_id', $userId)->count(),
                'totalPenilaian' => Penilaian::where('user_id', $userId)->count(),
            ],
            'jadwalHariIni' => Jadwal::with('subject')
                ->where('user_id', $userId)
                ->get(),
        ]);
    }
}

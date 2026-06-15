<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JadwalController extends Controller
{
    public function index()
    {
        $jadwals = Jadwal::with('subject')
            ->where('user_id', Auth::id())
            ->orderByRaw("FIELD(hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')")
            ->paginate(10);

        return Inertia::render('Ustadz/Jadwal/Index', [
            'jadwals' => $jadwals,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Models\Santri;
use App\Models\Penilaian;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SantriController extends Controller
{
    public function index()
    {
        $santris = Santri::latest()->paginate(10);

        return Inertia::render('Ustadz/Santri/Index', [
            'santris' => $santris,
        ]);
    }

    public function detail($id)
    {
        $santri = Santri::findOrFail($id);
        $penilaians = Penilaian::with('subject')
            ->where('santri_id', $id)
            ->where('user_id', Auth::id())
            ->get();

        return Inertia::render('Ustadz/Santri/Detail', [
            'santri' => $santri,
            'penilaians' => $penilaians,
        ]);
    }
}

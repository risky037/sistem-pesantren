<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Models\Santri;
use App\Models\Penilaian;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SantriController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $filters = $request->only(['search']);

        $santris = Santri::when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nis', 'like', '%' . $search . '%')
                      ->orWhere('nama', 'like', '%' . $search . '%')
                      ->orWhere('kelas', 'like', '%' . $search . '%')
                      ->orWhere('program', 'like', '%' . $search . '%')
                      ->orWhere('status', 'like', '%' . $search . '%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Ustadz/Santri/Index', [
            'santris' => $santris,
            'filters' => $filters,
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

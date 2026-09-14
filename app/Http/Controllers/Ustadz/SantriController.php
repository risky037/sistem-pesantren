<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\Penilaian;
use App\Models\Santri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SantriController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Santri::class);

        $filters = $request->only(['search']);

        $santris = Santri::when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('nis', 'like', '%'.$search.'%')
                    ->orWhere('nama', 'like', '%'.$search.'%')
                    ->orWhere('kelas', 'like', '%'.$search.'%')
                    ->orWhere('program', 'like', '%'.$search.'%')
                    ->orWhere('status', 'like', '%'.$search.'%');
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
        Gate::authorize('view', $santri);

        $penilaians = Penilaian::with('subject')
            ->where('santri_id', $id)
            ->where('user_id', Auth::id())
            ->where('academic_period_id', AcademicPeriod::active()->first()?->id)
            ->get();

        return Inertia::render('Ustadz/Santri/Detail', [
            'santri' => $santri,
            'penilaians' => $penilaians,
        ]);
    }
}

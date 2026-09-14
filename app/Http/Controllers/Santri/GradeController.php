<?php

namespace App\Http\Controllers\Santri;

use App\Http\Controllers\Controller;
use App\Models\Penilaian;
use App\Models\Santri;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class GradeController extends Controller
{
    public function index()
    {
        Gate::authorize('viewGrades', Santri::class);

        $user = request()->user();

        $grades = Penilaian::with(['subject', 'ustadz', 'academicPeriod'])
            ->where('santri_id', $user->santri->id)
            ->get();

        return Inertia::render('Santri/Grades', [
            'grades' => $grades,
        ]);
    }
}

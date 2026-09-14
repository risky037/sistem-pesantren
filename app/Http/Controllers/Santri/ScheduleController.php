<?php

namespace App\Http\Controllers\Santri;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\Jadwal;
use App\Models\Santri;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        Gate::authorize('viewSchedule', Santri::class);

        $user = request()->user();

        // Fetch active period safely
        $activePeriod = AcademicPeriod::active()->first();

        $jadwals = [];
        if ($activePeriod) {
            $jadwals = Jadwal::with(['subject', 'ustadz'])
                ->where('kelas', $user->santri->kelas)
                ->where('academic_period_id', $activePeriod->id)
                ->get();
        }

        return Inertia::render('Santri/Schedule', [
            'jadwals' => $jadwals,
            'activePeriod' => $activePeriod,
        ]);
    }
}

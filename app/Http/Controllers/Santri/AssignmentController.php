<?php

namespace App\Http\Controllers\Santri;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $santri = $request->user()->santri;
        $activePeriod = AcademicPeriod::where('is_active', true)->first();

        $assignments = Assignment::with(['subject', 'ustadz'])
            ->where('academic_period_id', $activePeriod?->id)
            ->where('kelas', $santri?->kelas)
            ->whereIn('status', ['open', 'closed'])
            ->latest()
            ->paginate(15);

        if ($santri) {
            $submissions = Submission::where('santri_id', $santri->id)
                ->whereIn('assignment_id', $assignments->pluck('id'))
                ->get()
                ->keyBy('assignment_id');

            $assignments->through(function ($assignment) use ($submissions) {
                $assignment->submission = $submissions->get($assignment->id);

                return $assignment;
            });
        }

        return Inertia::render('Santri/Assignment/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function show(Request $request, Assignment $assignment): Response
    {
        $santri = $request->user()->santri;

        $submission = Submission::where('assignment_id', $assignment->id)
            ->where('santri_id', $santri?->id)
            ->first();

        $assignment->load(['subject', 'ustadz']);

        return Inertia::render('Santri/Assignment/Show', [
            'assignment' => $assignment,
            'submission' => $submission,
        ]);
    }
}

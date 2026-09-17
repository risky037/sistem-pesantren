<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    public function index(Request $request, Assignment $assignment)
    {
        Gate::authorize('view', $assignment);

        $submissions = Submission::with('santri.user')
            ->where('assignment_id', $assignment->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Ustadz/Assignment/Submissions', [
            'assignment' => $assignment,
            'submissions' => $submissions,
        ]);
    }
}

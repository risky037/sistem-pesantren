<?php

namespace App\Http\Controllers\Santri;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Requests\UpdateSubmissionRequest;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    public function index(Request $request)
    {
        $santri = $request->user()->santri;

        $submissions = Submission::with('assignment')
            ->where('santri_id', $santri->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Santri/Submissions/Index', [
            'submissions' => $submissions,
        ]);
    }

    public function create(Assignment $assignment)
    {
        // For santri to create a submission for a specific assignment
        return Inertia::render('Santri/Submissions/Create', [
            'assignment' => $assignment,
        ]);
    }

    public function store(StoreSubmissionRequest $request, Assignment $assignment)
    {
        $santri = $request->user()->santri;

        // Ensure no duplicate submission exists
        $existing = Submission::where('assignment_id', $assignment->id)
            ->where('santri_id', $santri->id)
            ->first();

        if ($existing) {
            return redirect()->back()->withErrors(['assignment_id' => 'Submission already exists.']);
        }

        $submission = Submission::create([
            'assignment_id' => $assignment->id,
            'santri_id' => $santri->id,
            'content' => $request->content,
            'status' => 'draft',
        ]);

        return redirect()->route('santri.submissions.index')->with('success', 'Submission draft saved.');
    }

    public function update(UpdateSubmissionRequest $request, Submission $submission)
    {
        Gate::authorize('update', $submission);

        $submission->update([
            'content' => $request->content,
        ]);

        return redirect()->route('santri.submissions.index')->with('success', 'Submission draft updated.');
    }

    public function submit(Request $request, Submission $submission)
    {
        Gate::authorize('submit', $submission);

        $submission->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return redirect()->route('santri.submissions.index')->with('success', 'Submission submitted successfully.');
    }
}

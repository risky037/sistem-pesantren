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
        return redirect()->route('santri.assignments.index');
    }

    public function create(Request $request, Assignment $assignment)
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

        return redirect()->route('santri.assignments.show', $assignment->id)
            ->with('submission_id', $submission->id)
            ->with('success', 'Submission draft saved.');
    }

    public function update(UpdateSubmissionRequest $request, Submission $submission)
    {
        Gate::authorize('update', $submission);

        $submission->update([
            'content' => $request->content,
        ]);

        return redirect()->route('santri.assignments.show', $submission->assignment_id)
            ->with('submission_id', $submission->id)
            ->with('success', 'Submission draft updated.');
    }

    public function submit(Request $request, Submission $submission)
    {
        Gate::authorize('submit', $submission);

        $submission->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return redirect()->route('santri.assignments.show', $submission->assignment_id)
            ->with('success', 'Submission submitted successfully.');
    }
}

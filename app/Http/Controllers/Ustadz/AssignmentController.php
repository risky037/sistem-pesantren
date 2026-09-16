<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssignmentRequest;
use App\Http\Requests\UpdateAssignmentRequest;
use App\Models\AcademicPeriod;
use App\Models\Assignment;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Assignment::class);

        $activePeriod = AcademicPeriod::requireActive();

        $assignments = Assignment::with(['subject'])
            ->where('ustadz_id', Auth::id())
            ->where('academic_period_id', $activePeriod->id)
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Ustadz/Assignment/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Assignment::class);

        $activePeriod = AcademicPeriod::requireActive();

        $jadwals = Jadwal::with('subject')
            ->where('user_id', Auth::id())
            ->where('academic_period_id', $activePeriod->id)
            ->get();

        $subjects = $jadwals->pluck('subject')->unique('id')->values();
        $kelasList = $jadwals->pluck('kelas')->unique()->values();

        return Inertia::render('Ustadz/Assignment/Create', [
            'subjects' => $subjects,
            'kelasList' => $kelasList,
        ]);
    }

    public function store(StoreAssignmentRequest $request)
    {
        $assignment = Assignment::create([
            ...$request->validated(),
            'ustadz_id' => Auth::id(),
            'academic_period_id' => AcademicPeriod::requireActive()->id,
            'status' => 'draft',
        ]);

        return redirect()->route('ustadz.assignments.index')->with('success', 'Tugas berhasil dibuat.');
    }

    public function edit(Assignment $assignment)
    {
        Gate::authorize('update', $assignment);

        return Inertia::render('Ustadz/Assignment/Edit', [
            'assignment' => $assignment->load('subject'),
        ]);
    }

    public function update(UpdateAssignmentRequest $request, Assignment $assignment)
    {
        Gate::authorize('update', $assignment);

        $assignment->update($request->validated());

        return redirect()->route('ustadz.assignments.index')->with('success', 'Tugas berhasil diperbarui.');
    }

    public function destroy(Assignment $assignment)
    {
        Gate::authorize('delete', $assignment);

        $assignment->delete();

        return redirect()->route('ustadz.assignments.index')->with('success', 'Tugas berhasil dihapus.');
    }

    public function open(Assignment $assignment)
    {
        Gate::authorize('open', $assignment);

        $assignment->update(['status' => 'open']);

        return redirect()->route('ustadz.assignments.index')->with('success', 'Tugas berhasil dibuka.');
    }

    public function close(Assignment $assignment)
    {
        Gate::authorize('close', $assignment);

        $assignment->update(['status' => 'closed']);

        return redirect()->route('ustadz.assignments.index')->with('success', 'Tugas berhasil ditutup.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAcademicPeriodRequest;
use App\Http\Requests\Admin\UpdateAcademicPeriodRequest;
use App\Models\AcademicPeriod;
use App\Services\AcademicPeriodService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AcademicPeriodController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', AcademicPeriod::class);

        $search = $request->input('search');
        $periods = AcademicPeriod::when($search, function ($query, $search) {
            $query->where('tahun_ajaran', 'like', '%'.$search.'%')
                ->orWhere('semester', 'like', '%'.$search.'%');
        })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/AcademicPeriod/Index', [
            'periods' => $periods,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', AcademicPeriod::class);

        return Inertia::render('Admin/AcademicPeriod/Create');
    }

    public function store(StoreAcademicPeriodRequest $request)
    {
        Gate::authorize('create', AcademicPeriod::class);
        AcademicPeriod::create($request->validated());

        return redirect()->route('admin.academic-period.index')->with('success', 'Academic Period berhasil ditambahkan.');
    }

    public function edit(AcademicPeriod $academicPeriod)
    {
        Gate::authorize('update', $academicPeriod);

        return Inertia::render('Admin/AcademicPeriod/Edit', [
            'period' => $academicPeriod,
        ]);
    }

    public function update(UpdateAcademicPeriodRequest $request, AcademicPeriod $academicPeriod)
    {
        Gate::authorize('update', $academicPeriod);

        $academicPeriod->update($request->validated());

        return redirect()->route('admin.academic-period.index')->with('success', 'Academic Period berhasil diperbarui.');
    }

    public function destroy(AcademicPeriod $academicPeriod)
    {
        Gate::authorize('delete', $academicPeriod);

        if ($academicPeriod->is_active) {
            return redirect()->route('admin.academic-period.index')->with('error', 'Tidak dapat menghapus Academic Period yang sedang aktif.');
        }

        $academicPeriod->delete();

        return redirect()->route('admin.academic-period.index')->with('success', 'Academic Period berhasil dihapus.');
    }

    public function activate(AcademicPeriod $academicPeriod, AcademicPeriodService $service)
    {
        Gate::authorize('update', $academicPeriod);

        $service->setActivePeriod($academicPeriod);

        return redirect()->route('admin.academic-period.index')->with('success', 'Academic Period berhasil diaktifkan.');
    }
}

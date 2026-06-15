<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Subject;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $filters = $request->only(['search']);

        $subjects = Subject::when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kode_mapel', 'like', '%' . $search . '%')
                      ->orWhere('nama_mapel', 'like', '%' . $search . '%')
                      ->orWhere('deskripsi', 'like', '%' . $search . '%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/MapelClass/Index', [
            'subjects' => $subjects,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/MapelClass/Create');
    }

    public function store(StoreSubjectRequest $request)
    {
        Subject::create($request->validated());

        return redirect()->route('admin.mapel.index')->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $subject = Subject::findOrFail($id);

        return Inertia::render('Admin/MapelClass/Edit', [
            'subject' => $subject,
        ]);
    }

    public function update(UpdateSubjectRequest $request, $id)
    {
        $subject = Subject::findOrFail($id);
        $subject->update($request->validated());

        return redirect()->route('admin.mapel.index')->with('success', 'Mata pelajaran berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();

        return redirect()->route('admin.mapel.index')->with('success', 'Mata pelajaran berhasil dihapus.');
    }
}

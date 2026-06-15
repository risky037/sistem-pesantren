<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSantriRequest;
use App\Http\Requests\UpdateSantriRequest;
use App\Models\Santri;
use Inertia\Inertia;

class SantriController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $filters = $request->only(['search', 'status', 'jenis_kelamin', 'kelas']);

        $santris = Santri::when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nis', 'like', '%' . $search . '%')
                      ->orWhere('nama', 'like', '%' . $search . '%')
                      ->orWhere('kelas', 'like', '%' . $search . '%')
                      ->orWhere('program', 'like', '%' . $search . '%')
                      ->orWhere('status', 'like', '%' . $search . '%');
                });
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['jenis_kelamin'] ?? null, function ($query, $jk) {
                $query->where('jenis_kelamin', $jk);
            })
            ->when($filters['kelas'] ?? null, function ($query, $kelas) {
                $query->where('kelas', $kelas);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Get unique kelas for filter dropdown
        $kelasList = Santri::select('kelas')->distinct()->orderBy('kelas')->pluck('kelas');

        return Inertia::render('Admin/Santri/Index', [
            'santris' => $santris,
            'filters' => $filters,
            'kelasList' => $kelasList,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Santri/Create');
    }

    public function store(StoreSantriRequest $request)
    {
        Santri::create($request->validated());

        return redirect()->route('admin.santri.index')->with('success', 'Santri berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $santri = Santri::findOrFail($id);

        return Inertia::render('Admin/Santri/Edit', [
            'santri' => $santri,
        ]);
    }

    public function update(UpdateSantriRequest $request, $id)
    {
        $santri = Santri::findOrFail($id);
        $santri->update($request->validated());

        return redirect()->route('admin.santri.index')->with('success', 'Data santri berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $santri = Santri::findOrFail($id);
        $santri->delete();

        return redirect()->route('admin.santri.index')->with('success', 'Santri berhasil dihapus.');
    }
}

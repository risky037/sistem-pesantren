<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSantriRequest;
use App\Http\Requests\UpdateSantriRequest;
use App\Models\Santri;
use Inertia\Inertia;

class SantriController extends Controller
{
    public function index()
    {
        $santris = Santri::latest()->paginate(10);

        return Inertia::render('Admin/Santri/Index', [
            'santris' => $santris,
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

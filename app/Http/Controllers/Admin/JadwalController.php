<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJadwalRequest;
use App\Http\Requests\UpdateJadwalRequest;
use App\Models\Jadwal;
use App\Models\Subject;
use App\Models\User;
use Inertia\Inertia;

class JadwalController extends Controller
{
    public function index()
    {
        $jadwals = Jadwal::with(['ustadz', 'subject'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Jadwal/Index', [
            'jadwals' => $jadwals,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Jadwal/Create', [
            'ustadzs' => User::where('role', 'ustadz')->select('id', 'name')->get(),
            'subjects' => Subject::select('id', 'nama_mapel')->get(),
        ]);
    }

    public function store(StoreJadwalRequest $request)
    {
        Jadwal::create($request->validated());

        return redirect()->route('admin.jadwal.index')->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $jadwal = Jadwal::with(['ustadz', 'subject'])->findOrFail($id);

        return Inertia::render('Admin/Jadwal/Edit', [
            'jadwal' => $jadwal,
            'ustadzs' => User::where('role', 'ustadz')->select('id', 'name')->get(),
            'subjects' => Subject::select('id', 'nama_mapel')->get(),
        ]);
    }

    public function update(UpdateJadwalRequest $request, $id)
    {
        $jadwal = Jadwal::findOrFail($id);
        $jadwal->update($request->validated());

        return redirect()->route('admin.jadwal.index')->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $jadwal = Jadwal::findOrFail($id);
        $jadwal->delete();

        return redirect()->route('admin.jadwal.index')->with('success', 'Jadwal berhasil dihapus.');
    }
}

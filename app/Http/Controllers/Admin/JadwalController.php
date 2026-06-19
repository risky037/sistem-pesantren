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
    public function index(\Illuminate\Http\Request $request)
    {
        $filters = $request->only(['search', 'hari', 'subject_id', 'user_id']);

        $jadwals = Jadwal::with(['ustadz', 'subject'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('hari', 'like', '%' . $search . '%')
                      ->orWhere('kelas', 'like', '%' . $search . '%')
                      ->orWhere('ruang', 'like', '%' . $search . '%')
                      ->orWhereHas('ustadz', function ($q2) use ($search) {
                          $q2->where('name', 'like', '%' . $search . '%');
                      })
                      ->orWhereHas('subject', function ($q3) use ($search) {
                          $q3->where('nama_mapel', 'like', '%' . $search . '%');
                      });
                });
            })
            ->when($filters['hari'] ?? null, function ($query, $hari) {
                $query->where('hari', $hari);
            })
            ->when($filters['subject_id'] ?? null, function ($query, $subjectId) {
                $query->where('subject_id', $subjectId);
            })
            ->when($filters['user_id'] ?? null, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Jadwal/Index', [
            'jadwals' => $jadwals,
            'filters' => $filters,
            'subjects' => Subject::select('id', 'nama_mapel')->orderBy('nama_mapel')->get(),
            'ustadzs' => User::where('role', 'ustadz')->select('id', 'name')->orderBy('name')->get(),
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

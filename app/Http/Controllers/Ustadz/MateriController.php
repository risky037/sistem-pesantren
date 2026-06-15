<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMateriRequest;
use App\Http\Requests\UpdateMateriRequest;
use App\Models\Materi;
use App\Models\Subject;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MateriController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $filters = $request->only(['search', 'subject_id', 'kelas']);

        $materis = Materi::with('subject')
            ->where('user_id', Auth::id())
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('judul', 'like', '%' . $search . '%')
                      ->orWhere('deskripsi', 'like', '%' . $search . '%')
                      ->orWhere('kelas', 'like', '%' . $search . '%')
                      ->orWhereHas('subject', function ($q2) use ($search) {
                          $q2->where('nama_mapel', 'like', '%' . $search . '%');
                      });
                });
            })
            ->when($filters['subject_id'] ?? null, function ($query, $subjectId) {
                $query->where('subject_id', $subjectId);
            })
            ->when($filters['kelas'] ?? null, function ($query, $kelas) {
                $query->where('kelas', $kelas);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $kelasList = Materi::where('user_id', Auth::id())->whereNotNull('kelas')->select('kelas')->distinct()->orderBy('kelas')->pluck('kelas');

        return Inertia::render('Ustadz/Materi/Index', [
            'materis' => $materis,
            'filters' => $filters,
            'subjects' => Subject::select('id', 'nama_mapel')->orderBy('nama_mapel')->get(),
            'kelasList' => $kelasList,
        ]);
    }

    public function create()
    {
        return Inertia::render('Ustadz/Materi/Create', [
            'subjects' => Subject::select('id', 'nama_mapel')->get(),
        ]);
    }

    public function store(StoreMateriRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_path'] = $file->store('materi', 'public');
            $data['original_file_name'] = $file->getClientOriginalName();
        }

        unset($data['file']);
        Materi::create($data);

        return redirect()->route('ustadz.materi.index')->with('success', 'Materi berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $materi = Materi::with('subject')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return Inertia::render('Ustadz/Materi/Edit', [
            'materi' => $materi,
            'subjects' => Subject::select('id', 'nama_mapel')->get(),
        ]);
    }

    public function update(UpdateMateriRequest $request, $id)
    {
        $materi = Materi::where('user_id', Auth::id())->findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('file')) {
            // Delete old file
            if ($materi->file_path) {
                Storage::disk('public')->delete($materi->file_path);
            }
            $file = $request->file('file');
            $data['file_path'] = $file->store('materi', 'public');
            $data['original_file_name'] = $file->getClientOriginalName();
        }

        unset($data['file']);
        $materi->update($data);

        return redirect()->route('ustadz.materi.index')->with('success', 'Materi berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $materi = Materi::where('user_id', Auth::id())->findOrFail($id);

        if ($materi->file_path) {
            Storage::disk('public')->delete($materi->file_path);
        }

        $materi->delete();

        return redirect()->route('ustadz.materi.index')->with('success', 'Materi berhasil dihapus.');
    }
}

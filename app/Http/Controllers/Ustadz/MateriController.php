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
    public function index()
    {
        $materis = Materi::with('subject')
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Ustadz/Materi/Index', [
            'materis' => $materis,
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

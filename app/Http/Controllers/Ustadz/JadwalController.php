<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Models\Subject;

class JadwalController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $filters = $request->only(['search', 'hari', 'subject_id']);

        $jadwals = Jadwal::with('subject')
            ->where('user_id', Auth::id())
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('hari', 'like', '%' . $search . '%')
                      ->orWhere('kelas', 'like', '%' . $search . '%')
                      ->orWhere('ruang', 'like', '%' . $search . '%')
                      ->orWhereHas('subject', function ($q2) use ($search) {
                          $q2->where('nama_mapel', 'like', '%' . $search . '%');
                      });
                });
            })
            ->when($filters['hari'] ?? null, function ($query, $hari) {
                $query->where('hari', $hari);
            })
            ->when($filters['subject_id'] ?? null, function ($query, $subjectId) {
                $query->where('subject_id', $subjectId);
            })
            ->orderByRaw("FIELD(hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')")
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Ustadz/Jadwal/Index', [
            'jadwals' => $jadwals,
            'filters' => $filters,
            'subjects' => Subject::select('id', 'nama_mapel')->orderBy('nama_mapel')->get(),
        ]);
    }
}

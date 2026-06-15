<?php

namespace App\Http\Controllers\Ustadz;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePenilaianRequest;
use App\Models\Jadwal;
use App\Models\Penilaian;
use App\Models\Santri;
use App\Models\Subject;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PenilaianController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // Get subjects this ustadz teaches via jadwal
        $subjectIds = Jadwal::where('user_id', $userId)->pluck('subject_id')->unique();
        $subjects = Subject::whereIn('id', $subjectIds)->get();

        // Build summary: for each subject, count total santri and graded santri
        $summary = $subjects->map(function ($subject) use ($userId) {
            $kelasForSubject = Jadwal::where('user_id', $userId)
                ->where('subject_id', $subject->id)
                ->pluck('kelas')
                ->unique();

            $totalSantri = Santri::whereIn('kelas', $kelasForSubject)->count();
            $gradedSantri = Penilaian::where('user_id', $userId)
                ->where('subject_id', $subject->id)
                ->count();

            return [
                'id' => $subject->id,
                'nama_mapel' => $subject->nama_mapel,
                'kelas' => $kelasForSubject->values(),
                'totalSantri' => $totalSantri,
                'gradedSantri' => $gradedSantri,
            ];
        });

        return Inertia::render('Ustadz/Penilaian/Index', [
            'summary' => $summary,
        ]);
    }

    public function input($subjectId)
    {
        $userId = Auth::id();
        $subject = Subject::findOrFail($subjectId);

        // Get kelas that this ustadz teaches for this subject
        $kelasForSubject = Jadwal::where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->pluck('kelas')
            ->unique();

        $santris = Santri::whereIn('kelas', $kelasForSubject)->orderBy('nama')->get();

        // Get existing grades
        $existingGrades = Penilaian::where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->get()
            ->keyBy('santri_id');

        return Inertia::render('Ustadz/Penilaian/Input', [
            'subject' => $subject,
            'santris' => $santris,
            'existingGrades' => $existingGrades,
        ]);
    }

    public function store(StorePenilaianRequest $request, $subjectId)
    {
        $userId = Auth::id();

        foreach ($request->grades as $grade) {
            $tugas = $grade['tugas'] ?? null;
            $uts = $grade['uts'] ?? null;
            $uas = $grade['uas'] ?? null;

            $nilaiAkhir = null;
            $count = 0;
            $sum = 0;
            if ($tugas !== null) { $sum += $tugas; $count++; }
            if ($uts !== null) { $sum += $uts; $count++; }
            if ($uas !== null) { $sum += $uas; $count++; }
            if ($count > 0) { $nilaiAkhir = round($sum / $count, 2); }

            Penilaian::updateOrCreate(
                [
                    'user_id' => $userId,
                    'santri_id' => $grade['santri_id'],
                    'subject_id' => $subjectId,
                ],
                [
                    'tugas' => $tugas,
                    'uts' => $uts,
                    'uas' => $uas,
                    'nilai_akhir' => $nilaiAkhir,
                ]
            );
        }

        return redirect()->route('ustadz.penilaian.index')->with('success', 'Nilai berhasil disimpan.');
    }
}

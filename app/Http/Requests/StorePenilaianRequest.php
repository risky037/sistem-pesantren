<?php

namespace App\Http\Requests;

use App\Models\Jadwal;
use App\Models\Penilaian;
use App\Models\Santri;
use Illuminate\Foundation\Http\FormRequest;

class StorePenilaianRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user()->can('create', Penilaian::class)) {
            return false;
        }

        $subjectId = $this->route('id');
        $grades = $this->input('grades', []);

        if (empty($grades)) {
            return true; // Let validation rules handle empty arrays
        }

        $santriIds = collect($grades)->pluck('santri_id')->filter()->unique();

        if ($santriIds->isEmpty()) {
            return true;
        }

        // Check if the current user teaches these santri for this subject
        $validClasses = Jadwal::where('user_id', $this->user()->id)
            ->where('subject_id', $subjectId)
            ->pluck('kelas');

        if ($validClasses->isEmpty()) {
            return false;
        }

        // All submitted santri_ids must be enrolled in one of the valid classes
        $validSantriCount = Santri::whereIn('id', $santriIds)
            ->whereIn('kelas', $validClasses)
            ->count();

        return $validSantriCount === $santriIds->count();
    }

    public function rules(): array
    {
        return [
            'grades' => ['required', 'array', 'min:1'],
            'grades.*.santri_id' => ['required', 'exists:santris,id'],
            'grades.*.tugas' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grades.*.uts' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grades.*.uas' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}

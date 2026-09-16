<?php

namespace App\Http\Requests;

use App\Models\AcademicPeriod;
use App\Models\Assignment;
use App\Models\Jadwal;
use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user()->can('create', Assignment::class)) {
            return false;
        }

        $activePeriod = AcademicPeriod::requireActive();

        return Jadwal::where('user_id', $this->user()->id)
            ->where('subject_id', $this->input('subject_id'))
            ->where('kelas', $this->input('kelas'))
            ->where('academic_period_id', $activePeriod->id)
            ->exists();
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'exists:subjects,id'],
            'kelas' => ['required', 'string', 'in:'.implode(',', config('pesantren.kelas_allowed'))],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date', 'after:now'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePenilaianRequest extends FormRequest
{
    public function authorize(): bool { return true; }

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

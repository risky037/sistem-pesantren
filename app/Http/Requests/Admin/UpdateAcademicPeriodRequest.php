<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAcademicPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('academic_period')->id;

        return [
            'tahun_ajaran' => [
                'required',
                'string',
                Rule::unique('academic_periods')->where(function ($query) {
                    return $query->where('semester', $this->semester);
                })->ignore($id),
            ],
            'semester' => ['required', 'string'],
            'started_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date', 'after_or_equal:started_at'],
        ];
    }
}

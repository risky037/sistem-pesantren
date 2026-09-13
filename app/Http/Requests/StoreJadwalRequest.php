<?php

namespace App\Http\Requests;

use App\Enums\Hari;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJadwalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'hari' => ['required', 'string', Rule::enum(Hari::class)],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'kelas' => ['required', 'string', Rule::in(config('pesantren.kelas_allowed'))],
            'ruang' => ['nullable', 'string', 'max:50'],
        ];
    }
}

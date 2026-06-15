<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJadwalRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'hari' => ['required', 'string', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'kelas' => ['required', 'string', 'max:20'],
            'ruang' => ['nullable', 'string', 'max:50'],
        ];
    }
}

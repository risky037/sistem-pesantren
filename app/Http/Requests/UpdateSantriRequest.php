<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSantriRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nis' => ['required', 'string', 'max:20', Rule::unique('santris')->ignore($this->route('id'))],
            'nama' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tanggal_lahir' => ['nullable', 'date'],
            'alamat' => ['nullable', 'string'],
            'kelas' => ['required', 'string', 'max:20'],
            'program' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:aktif,alumni,keluar'],
            'email' => ['nullable', 'email', 'max:255'],
            'telepon' => ['nullable', 'string', 'max:20'],
        ];
    }
}

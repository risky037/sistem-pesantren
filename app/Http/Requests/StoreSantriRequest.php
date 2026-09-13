<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSantriRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nis' => ['required', 'string', 'max:20', 'unique:santris,nis'],
            'nama' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'tanggal_lahir' => ['nullable', 'date'],
            'alamat' => ['nullable', 'string'],
            'kelas' => ['required', 'string', Rule::in(config('pesantren.kelas_allowed'))],
            'program' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:aktif,alumni,keluar'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'email_wali' => ['nullable', 'string', 'lowercase', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
            'telepon' => ['nullable', 'string', 'max:20'],
        ];
    }
}

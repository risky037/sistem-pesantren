<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMateriRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'exists:subjects,id'],
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'kelas' => ['nullable', 'string', 'max:20'],
            'file' => ['nullable', 'file', 'max:10240'], // 10MB max
            'published_at' => ['nullable', 'date'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Models\Materi;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMateriRequest extends FormRequest
{
    public function authorize(): bool
    {
        $materiId = $this->route('id');
        $materi = Materi::find($materiId);

        return $materi && $this->user()->can('update', $materi);
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'exists:subjects,id'],
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'kelas' => ['nullable', 'string', 'max:20'],
            'file' => ['nullable', 'file', 'max:10240'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}

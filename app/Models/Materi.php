<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materi extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject_id',
        'judul',
        'deskripsi',
        'kelas',
        'file_path',
        'original_file_name',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'date',
        ];
    }

    public function ustadz()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}

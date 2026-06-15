<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penilaian extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'santri_id',
        'subject_id',
        'tugas',
        'uts',
        'uas',
        'nilai_akhir',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tugas' => 'decimal:2',
            'uts' => 'decimal:2',
            'uas' => 'decimal:2',
            'nilai_akhir' => 'decimal:2',
        ];
    }

    public function ustadz()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}

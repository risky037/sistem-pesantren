<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject_id',
        'hari',
        'jam_mulai',
        'jam_selesai',
        'kelas',
        'ruang',
    ];

    public function ustadz()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}

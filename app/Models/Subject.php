<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_mapel',
        'nama_mapel',
        'deskripsi',
    ];

    public function jadwals()
    {
        return $this->hasMany(Jadwal::class);
    }

    public function penilaians()
    {
        return $this->hasMany(Penilaian::class);
    }

    public function materis()
    {
        return $this->hasMany(Materi::class);
    }
}

<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Get the user's role as a backed enum instance, or null if malformed/unsupported.
     */
    public function roleEnum(): ?UserRole
    {
        if ($this->role instanceof UserRole) {
            return $this->role;
        }

        return UserRole::tryFrom($this->role ?? '');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function jadwals()
    {
        return $this->hasMany(Jadwal::class);
    }

    public function materis()
    {
        return $this->hasMany(Materi::class);
    }

    public function penilaians()
    {
        return $this->hasMany(Penilaian::class);
    }

    public function santri()
    {
        return $this->hasOne(Santri::class);
    }
}

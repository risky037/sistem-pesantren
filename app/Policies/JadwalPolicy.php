<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Jadwal;
use App\Models\User;

class JadwalPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->roleEnum() === UserRole::Admin) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->roleEnum() === UserRole::Ustadz || $user->roleEnum() === UserRole::Santri;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Jadwal $jadwal): bool
    {
        if ($user->roleEnum() === UserRole::Ustadz) {
            return $user->id === $jadwal->user_id;
        }

        if ($user->roleEnum() === UserRole::Santri) {
            return $user->santri && $user->santri->kelas === $jadwal->kelas;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Jadwal $jadwal): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Jadwal $jadwal): bool
    {
        return false;
    }
}

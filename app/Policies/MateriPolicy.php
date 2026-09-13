<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\Materi;
use App\Models\User;

class MateriPolicy
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
    public function view(User $user, Materi $materi): bool
    {
        if ($user->roleEnum() === UserRole::Ustadz) {
            return $user->id === $materi->user_id;
        }

        if ($user->roleEnum() === UserRole::Santri) {
            return $user->santri && $user->santri->kelas === $materi->kelas;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->roleEnum() === UserRole::Ustadz;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Materi $materi): bool
    {
        $activePeriod = AcademicPeriod::requireActive();
        if ($materi->academic_period_id !== $activePeriod->id) {
            return false;
        }

        return $user->id === $materi->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Materi $materi): bool
    {
        $activePeriod = AcademicPeriod::requireActive();
        if ($materi->academic_period_id !== $activePeriod->id) {
            return false;
        }

        return $user->id === $materi->user_id;
    }
}

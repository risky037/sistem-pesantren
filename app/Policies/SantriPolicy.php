<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\Jadwal;
use App\Models\Santri;
use App\Models\User;

class SantriPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->roleEnum() === UserRole::Admin || $user->roleEnum() === UserRole::Ustadz;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Santri $santri): bool
    {
        if ($user->roleEnum() === UserRole::Admin) {
            return true;
        }

        if ($user->roleEnum() === UserRole::Ustadz) {
            $activePeriodId = AcademicPeriod::active()->first()?->id;

            if (! $activePeriodId) {
                return false;
            }

            return Jadwal::where('user_id', $user->id)
                ->where('kelas', $santri->kelas)
                ->where('academic_period_id', $activePeriodId)
                ->exists();
        }

        return $user->roleEnum() === UserRole::Santri && $user->santri?->id === $santri->id;
    }

    /**
     * Determine whether the user can view the Santri dashboard.
     */
    public function viewDashboard(User $user): bool
    {
        return $user->roleEnum() === UserRole::Santri && $user->santri !== null;
    }

    /**
     * Determine whether the user can view their schedule.
     */
    public function viewSchedule(User $user): bool
    {
        return $user->roleEnum() === UserRole::Santri && $user->santri !== null;
    }

    /**
     * Determine whether the user can view their grades.
     */
    public function viewGrades(User $user): bool
    {
        return $user->roleEnum() === UserRole::Santri && $user->santri !== null;
    }
}

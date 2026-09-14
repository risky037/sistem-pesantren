<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class SantriPolicy
{
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

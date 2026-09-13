<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\User;

class AcademicPeriodPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->roleEnum() === UserRole::Admin) {
            return true;
        }

        return false;
    }

    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, AcademicPeriod $academicPeriod): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, AcademicPeriod $academicPeriod): bool
    {
        return false;
    }

    public function delete(User $user, AcademicPeriod $academicPeriod): bool
    {
        return false;
    }
}

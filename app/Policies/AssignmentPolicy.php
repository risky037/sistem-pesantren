<?php

namespace App\Policies;

use App\Models\AcademicPeriod;
use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->role === 'ustadz' || $user->role === 'santri';
    }

    public function view(User $user, Assignment $assignment): bool
    {
        if ($user->role === 'ustadz') {
            return $user->id === $assignment->ustadz_id;
        }

        if ($user->role === 'santri' && $user->santri) {
            return $user->santri->kelas === $assignment->kelas
                && $assignment->status === 'open'
                && $assignment->academic_period_id === AcademicPeriod::requireActive()->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === 'ustadz';
    }

    public function update(User $user, Assignment $assignment): bool
    {
        if ($user->role === 'ustadz') {
            return $user->id === $assignment->ustadz_id
                && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
                && $assignment->status === 'draft';
        }

        return false;
    }

    public function delete(User $user, Assignment $assignment): bool
    {
        if ($user->role === 'ustadz') {
            return $user->id === $assignment->ustadz_id
                && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
                && $assignment->status === 'draft';
        }

        return false;
    }

    public function open(User $user, Assignment $assignment): bool
    {
        if ($user->role === 'ustadz') {
            return $user->id === $assignment->ustadz_id
                && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
                && $assignment->status === 'draft';
        }

        return false;
    }

    public function close(User $user, Assignment $assignment): bool
    {
        if ($user->role === 'ustadz') {
            return $user->id === $assignment->ustadz_id
                && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
                && $assignment->status === 'open';
        }

        return false;
    }
}

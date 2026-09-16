<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Submission;
use App\Models\User;

class SubmissionPolicy
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
     * Determine whether the user can view the model.
     */
    public function view(User $user, Submission $submission): bool
    {
        if ($user->roleEnum() === UserRole::Santri) {
            return $user->santri && $user->santri->id === $submission->santri_id;
        }

        if ($user->roleEnum() === UserRole::Ustadz) {
            // Note: Ustadz are explicitly permitted to view historical submissions from inactive academic periods.
            // This is required to allow Ustadz to reference previous assignments and scores.
            return $user->id === $submission->assignment->ustadz_id;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Submission $submission): bool
    {
        if ($user->roleEnum() === UserRole::Santri) {
            return $user->santri
                && $user->santri->id === $submission->santri_id
                && $submission->status === 'draft'
                && $submission->assignment->academicPeriod->is_active;
        }

        return false;
    }

    /**
     * Determine whether the user can submit the model.
     */
    public function submit(User $user, Submission $submission): bool
    {
        if ($user->roleEnum() === UserRole::Santri) {
            return $user->santri
                && $user->santri->id === $submission->santri_id
                && $submission->status === 'draft'
                && $submission->assignment->academicPeriod->is_active;
        }

        return false;
    }
}

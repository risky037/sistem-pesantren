<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Ustadz = 'ustadz';
    case Santri = 'santri';

    /**
     * Get the dashboard route name for the role, if implemented.
     */
    public function dashboardRouteName(): ?string
    {
        return match ($this) {
            self::Admin => 'admin.dashboard',
            self::Ustadz => 'ustadz.dashboard',
            self::Santri => 'santri.dashboard',
        };
    }
}

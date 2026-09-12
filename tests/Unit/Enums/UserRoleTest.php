<?php

namespace Tests\Unit\Enums;

use App\Enums\UserRole;
use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserRoleTest extends TestCase
{
    public function test_user_role_enum_cases_match_persisted_contract(): void
    {
        $this->assertSame('admin', UserRole::Admin->value);
        $this->assertSame('ustadz', UserRole::Ustadz->value);
        $this->assertSame('santri', UserRole::Santri->value);
        $this->assertCount(3, UserRole::cases());
    }

    public function test_dashboard_route_name_resolution(): void
    {
        $this->assertSame('admin.dashboard', UserRole::Admin->dashboardRouteName());
        $this->assertSame('ustadz.dashboard', UserRole::Ustadz->dashboardRouteName());
        $this->assertSame('santri.dashboard', UserRole::Santri->dashboardRouteName());
    }

    public function test_user_role_enum_defensive_hydration(): void
    {
        $user = new User;

        $user->role = UserRole::Admin;
        $this->assertSame(UserRole::Admin, $user->roleEnum());

        $user->role = 'admin';
        $this->assertSame(UserRole::Admin, $user->roleEnum());

        $user->role = 'unknown';
        $this->assertNull($user->roleEnum());

        $user->role = null;
        $this->assertNull($user->roleEnum());
    }
}

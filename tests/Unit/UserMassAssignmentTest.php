<?php

namespace Tests\Unit;

use App\Models\User;
use Tests\TestCase;

/**
 * Verifies that the User model protects against privilege escalation
 * via mass assignment of the role attribute.
 *
 * P0-1B.2b: 'role' was removed from User::$fillable to prevent any code path
 * that passes raw request data to User::create() or $user->update() from
 * allowing a caller to set an arbitrary role.
 */
class UserMassAssignmentTest extends TestCase
{
    public function test_role_is_not_mass_assignable(): void
    {
        $user = new User;

        $this->assertNotContains('role', $user->getFillable());
    }

    public function test_name_email_password_remain_mass_assignable(): void
    {
        $user = new User;
        $fillable = $user->getFillable();

        $this->assertContains('name', $fillable);
        $this->assertContains('email', $fillable);
        $this->assertContains('password', $fillable);
    }
}

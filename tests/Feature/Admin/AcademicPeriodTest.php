<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicPeriodTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_academic_periods(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $response = $this->actingAs($admin)->get(route('admin.academic-period.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_academic_period(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $response = $this->actingAs($admin)->post(route('admin.academic-period.store'), [
            'tahun_ajaran' => '2026/2027',
            'semester' => 'Ganjil',
        ]);
        $response->assertRedirect(route('admin.academic-period.index'));
        $this->assertDatabaseHas('academic_periods', [
            'tahun_ajaran' => '2026/2027',
            'semester' => 'Ganjil',
            'is_active' => false,
        ]);
    }

    public function test_admin_can_activate_academic_period(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $period1 = AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);
        $period2 = AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Genap', 'is_active' => false]);

        $response = $this->actingAs($admin)->post(route('admin.academic-period.activate', $period2->id));
        $response->assertRedirect(route('admin.academic-period.index'));

        $this->assertFalse($period1->fresh()->is_active);
        $this->assertTrue($period2->fresh()->is_active);
    }
}

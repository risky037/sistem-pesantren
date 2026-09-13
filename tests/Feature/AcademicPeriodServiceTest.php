<?php

namespace Tests\Feature;

use App\Models\AcademicPeriod;
use App\Services\AcademicPeriodService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicPeriodServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_require_active_throws_exception_if_none_active(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('No active academic period found.');

        AcademicPeriod::requireActive();
    }

    public function test_require_active_returns_active_period(): void
    {
        $period = AcademicPeriod::create([
            'tahun_ajaran' => '2025/2026',
            'semester' => 'Ganjil',
            'is_active' => true,
        ]);

        $active = AcademicPeriod::requireActive();
        $this->assertEquals($period->id, $active->id);
    }

    public function test_service_toggles_active_period(): void
    {
        $period1 = AcademicPeriod::create([
            'tahun_ajaran' => '2025/2026',
            'semester' => 'Ganjil',
            'is_active' => true,
        ]);

        $period2 = AcademicPeriod::create([
            'tahun_ajaran' => '2025/2026',
            'semester' => 'Genap',
            'is_active' => false,
        ]);

        $service = new AcademicPeriodService;
        $service->setActivePeriod($period2);

        $this->assertFalse($period1->fresh()->is_active);
        $this->assertTrue($period2->fresh()->is_active);
    }
}

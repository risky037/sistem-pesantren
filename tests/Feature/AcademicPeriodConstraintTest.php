<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\Jadwal;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicPeriodConstraintTest extends TestCase
{
    use RefreshDatabase;

    public function test_jadwal_composite_unique_constraint(): void
    {
        $period = AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);
        $user = User::factory()->create(['role' => UserRole::Ustadz->value]);
        $subject = Subject::create(['kode_mapel' => 'MAP1', 'nama_mapel' => 'M1']);

        Jadwal::create([
            'user_id' => $user->id,
            'subject_id' => $subject->id,
            'academic_period_id' => $period->id,
            'hari' => 'Senin',
            'jam_mulai' => '08:00',
            'jam_selesai' => '09:00',
            'kelas' => 'X-A',
        ]);

        // Duplicate in same period should fail
        $failed = false;
        try {
            Jadwal::create([
                'user_id' => $user->id,
                'subject_id' => $subject->id,
                'academic_period_id' => $period->id,
                'hari' => 'Senin',
                'jam_mulai' => '08:00',
                'jam_selesai' => '09:00',
                'kelas' => 'X-A',
            ]);
        } catch (QueryException $e) {
            $this->assertStringContainsString('UNIQUE constraint failed', $e->getMessage());
            $failed = true;
        }
        $this->assertTrue($failed);

        // Duplicate in different period should pass
        $period2 = AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Genap', 'is_active' => false]);
        Jadwal::create([
            'user_id' => $user->id,
            'subject_id' => $subject->id,
            'academic_period_id' => $period2->id,
            'hari' => 'Senin',
            'jam_mulai' => '08:00',
            'jam_selesai' => '09:00',
            'kelas' => 'X-A',
        ]);

        $this->assertDatabaseCount('jadwals', 2);
    }
}

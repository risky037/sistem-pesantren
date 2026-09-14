<?php

namespace Tests\Feature\Ustadz;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\Jadwal;
use App\Models\Penilaian;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SantriSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_ustadz_cannot_view_unrelated_santri(): void
    {
        $period = AcademicPeriod::first() ?? AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);
        $ustadz = User::factory()->create(['role' => UserRole::Ustadz]);

        // This santri is NOT in any of the ustadz's jadwals
        $unrelatedSantriUser = User::factory()->create(['role' => UserRole::Santri]);
        $unrelatedSantri = Santri::create([
            'user_id' => $unrelatedSantriUser->id,
            'nis' => '12345',
            'nama' => 'Santri Unrelated',
            'kelas' => '10-B',
            'jenis_kelamin' => 'Laki-laki',
        ]);

        $response = $this->actingAs($ustadz)->get(route('ustadz.santri.detail', $unrelatedSantri->id));

        $response->assertStatus(403);
    }

    public function test_ustadz_can_view_assigned_santri(): void
    {
        $period = AcademicPeriod::first() ?? AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);
        $ustadz = User::factory()->create(['role' => UserRole::Ustadz]);
        $subject = Subject::create(['nama_mapel' => 'Test Subject', 'kode_mapel' => 'TS01']);

        // This santri IS in the ustadz's jadwal class
        $assignedSantriUser = User::factory()->create(['role' => UserRole::Santri]);
        $assignedSantri = Santri::create([
            'user_id' => $assignedSantriUser->id,
            'nis' => '67890',
            'nama' => 'Santri Assigned',
            'kelas' => '10-A',
            'jenis_kelamin' => 'Laki-laki',
        ]);

        Jadwal::create([
            'academic_period_id' => $period->id,
            'user_id' => $ustadz->id,
            'subject_id' => $subject->id,
            'kelas' => '10-A',
            'hari' => 'Senin',
            'jam_mulai' => '08:00',
            'jam_selesai' => '09:00',
        ]);

        $response = $this->actingAs($ustadz)->get(route('ustadz.santri.detail', $assignedSantri->id));

        $response->assertStatus(200);
    }

    public function test_historical_grades_are_not_visible_in_current_period(): void
    {
        $pastPeriod = AcademicPeriod::create(['tahun_ajaran' => '2024/2025', 'semester' => 'Genap', 'is_active' => false]);
        $activePeriod = AcademicPeriod::active()->first() ?? AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);

        $ustadz = User::factory()->create(['role' => UserRole::Ustadz]);
        $subject = Subject::create(['nama_mapel' => 'Test Subject', 'kode_mapel' => 'TS01']);

        $assignedSantriUser = User::factory()->create(['role' => UserRole::Santri]);
        $assignedSantri = Santri::create([
            'user_id' => $assignedSantriUser->id,
            'nis' => '67890',
            'nama' => 'Santri Assigned',
            'kelas' => '10-A',
            'jenis_kelamin' => 'Laki-laki',
        ]);

        Jadwal::create([
            'academic_period_id' => $activePeriod->id, // Taught currently so ustadz can view
            'user_id' => $ustadz->id,
            'subject_id' => $subject->id,
            'kelas' => '10-A',
            'hari' => 'Senin',
            'jam_mulai' => '08:00',
            'jam_selesai' => '09:00',
        ]);

        // Historical grade from past period
        Penilaian::create([
            'academic_period_id' => $pastPeriod->id,
            'user_id' => $ustadz->id,
            'santri_id' => $assignedSantri->id,
            'subject_id' => $subject->id,
            'tugas' => 100,
            'is_published' => true,
        ]);

        $response = $this->actingAs($ustadz)->get(route('ustadz.santri.detail', $assignedSantri->id));

        $response->assertStatus(200);
        // The penilaians passed to inertia should be empty or not contain the past grade
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Ustadz/Santri/Detail')
            ->has('penilaians', 0)
        );
    }
}

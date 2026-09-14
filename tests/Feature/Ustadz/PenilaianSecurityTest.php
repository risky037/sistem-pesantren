<?php

namespace Tests\Feature\Ustadz;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\Jadwal;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PenilaianSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_ustadz_cannot_create_penilaian_for_unrelated_santri(): void
    {
        $period = AcademicPeriod::first() ?? AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);
        $ustadz = User::factory()->create(['role' => UserRole::Ustadz]);
        $subject = Subject::create(['nama_mapel' => 'Test Subject', 'kode_mapel' => 'TS01']);

        // This santri is NOT in any of the ustadz's jadwals
        $unrelatedSantriUser = User::factory()->create(['role' => UserRole::Santri]);
        $unrelatedSantri = Santri::create([
            'user_id' => $unrelatedSantriUser->id,
            'nis' => '12345',
            'nama' => 'Santri Unrelated',
            'kelas' => '10-B',
            'jenis_kelamin' => 'Laki-laki',
        ]);

        // Give the ustadz a jadwal but for a DIFFERENT kelas
        Jadwal::create([
            'academic_period_id' => $period->id,
            'user_id' => $ustadz->id,
            'subject_id' => $subject->id,
            'kelas' => '10-A',
            'hari' => 'Senin',
            'jam_mulai' => '08:00',
            'jam_selesai' => '09:00',
        ]);

        $response = $this->actingAs($ustadz)->post(route('ustadz.penilaian.store', $subject->id), [
            'grades' => [
                [
                    'santri_id' => $unrelatedSantri->id,
                    'tugas' => 90,
                    'uts' => 85,
                    'uas' => 88,
                ],
            ],
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('penilaians', [
            'santri_id' => $unrelatedSantri->id,
            'subject_id' => $subject->id,
        ]);
    }

    public function test_ustadz_can_create_penilaian_for_assigned_santri(): void
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

        $response = $this->actingAs($ustadz)->post(route('ustadz.penilaian.store', $subject->id), [
            'grades' => [
                [
                    'santri_id' => $assignedSantri->id,
                    'tugas' => 90,
                    'uts' => 85,
                    'uas' => 88,
                ],
            ],
        ]);

        $response->assertRedirect(route('ustadz.penilaian.index'));
        $this->assertDatabaseHas('penilaians', [
            'santri_id' => $assignedSantri->id,
            'subject_id' => $subject->id,
            'tugas' => 90,
        ]);
    }

    public function test_ustadz_cannot_create_penilaian_using_previous_period_schedule(): void
    {
        $pastPeriod = AcademicPeriod::create(['tahun_ajaran' => '2024/2025', 'semester' => 'Genap', 'is_active' => false]);
        $activePeriod = AcademicPeriod::active()->first() ?? AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);

        $ustadz = User::factory()->create(['role' => UserRole::Ustadz]);
        $subject = Subject::create(['nama_mapel' => 'Test Subject Past', 'kode_mapel' => 'TS02']);

        $santriUser = User::factory()->create(['role' => UserRole::Santri]);
        $santri = Santri::create([
            'user_id' => $santriUser->id,
            'nis' => '11223',
            'nama' => 'Santri Past',
            'kelas' => '10-A',
            'jenis_kelamin' => 'Laki-laki',
        ]);

        // Ustadz taught this santri in the PAST period
        Jadwal::create([
            'academic_period_id' => $pastPeriod->id,
            'user_id' => $ustadz->id,
            'subject_id' => $subject->id,
            'kelas' => '10-A',
            'hari' => 'Senin',
            'jam_mulai' => '08:00',
            'jam_selesai' => '09:00',
        ]);

        // Attempting to submit grades in the ACTIVE period should fail
        $response = $this->actingAs($ustadz)->post(route('ustadz.penilaian.store', $subject->id), [
            'grades' => [
                [
                    'santri_id' => $santri->id,
                    'tugas' => 90,
                    'uts' => 85,
                    'uas' => 88,
                ],
            ],
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('penilaians', [
            'santri_id' => $santri->id,
            'subject_id' => $subject->id,
        ]);
    }
}

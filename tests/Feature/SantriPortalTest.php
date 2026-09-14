<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\Jadwal;
use App\Models\Penilaian;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SantriPortalTest extends TestCase
{
    use RefreshDatabase;

    private function createActiveSantri($kelas = 'X-A')
    {
        $user = User::factory()->create([
            'role' => UserRole::Santri->value,
            'is_active' => true,
        ]);

        $santri = Santri::factory()->create([
            'user_id' => $user->id,
            'kelas' => $kelas,
        ]);

        return $user;
    }

    public function test_santri_can_access_own_dashboard()
    {
        $user = $this->createActiveSantri();

        $response = $this->actingAs($user)->get(route('santri.dashboard'));

        $response->assertStatus(200);
    }

    public function test_santri_cannot_access_admin_routes()
    {
        $user = $this->createActiveSantri();

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        $response->assertStatus(403);
    }

    public function test_santri_cannot_access_ustadz_routes()
    {
        $user = $this->createActiveSantri();

        $response = $this->actingAs($user)->get(route('ustadz.dashboard'));

        $response->assertStatus(403);
    }

    public function test_santri_cannot_view_another_santri_grades()
    {
        $santri1 = $this->createActiveSantri('X-A');
        $santri2 = $this->createActiveSantri('X-B');

        $period = AcademicPeriod::factory()->active()->create();
        $subject = Subject::create([
            'kode_mapel' => 'MAPEL-'.uniqid(),
            'nama_mapel' => 'Test Subject',
            'deskripsi' => 'Test',
        ]);
        $ustadz = User::factory()->create(['role' => UserRole::Ustadz->value]);

        $gradeForSantri2 = Penilaian::create([
            'user_id' => $ustadz->id,
            'santri_id' => $santri2->santri->id,
            'subject_id' => $subject->id,
            'academic_period_id' => $period->id,
            'nilai_akhir' => 95,
        ]);

        // Santri 1 fetches grades
        $response = $this->actingAs($santri1)->get(route('santri.grades'));

        $response->assertStatus(200);

        // Assert gradeForSantri2 is not in the view props
        $response->assertInertia(fn ($page) => $page
            ->component('Santri/Grades')
            ->where('grades', function ($grades) use ($gradeForSantri2) {
                return collect($grades)->where('id', $gradeForSantri2->id)->count() === 0;
            })
        );
    }

    public function test_santri_cannot_manipulate_academic_period_id()
    {
        $user = $this->createActiveSantri('X-A');

        $activePeriod = AcademicPeriod::factory()->active()->create(['tahun_ajaran' => '2025/2026']);
        $historicalPeriod = AcademicPeriod::factory()->create(['tahun_ajaran' => '2024/2025']); // inactive by default

        $subject = Subject::create([
            'kode_mapel' => 'MAPEL-'.uniqid(),
            'nama_mapel' => 'Test Subject',
            'deskripsi' => 'Test',
        ]);
        $ustadz = User::factory()->create(['role' => UserRole::Ustadz->value]);

        $historicalJadwal = Jadwal::create([
            'academic_period_id' => $historicalPeriod->id,
            'subject_id' => $subject->id,
            'user_id' => $ustadz->id,
            'kelas' => 'X-A',
            'hari' => 'Senin',
            'jam_mulai' => '08:00:00',
            'jam_selesai' => '09:00:00',
        ]);

        // Fetch schedule trying to inject historical period ID
        $response = $this->actingAs($user)->get(route('santri.schedule', ['academic_period_id' => $historicalPeriod->id]));

        $response->assertStatus(200);

        // Assert the page still received the active period, rejecting the tampering
        // And assert the historical jadwal is not leaked
        $response->assertInertia(fn ($page) => $page
            ->component('Santri/Schedule')
            ->where('activePeriod.id', $activePeriod->id)
            ->where('jadwals', function ($jadwals) use ($historicalJadwal) {
                return collect($jadwals)->where('id', $historicalJadwal->id)->count() === 0;
            })
        );
    }

    public function test_inactive_santri_cannot_access_portal()
    {
        $user = User::factory()->create([
            'role' => UserRole::Santri->value,
            'is_active' => false, // Inactive
        ]);

        Santri::factory()->create([
            'user_id' => $user->id,
            'kelas' => 'X-A',
        ]);

        $response = $this->actingAs($user)->get(route('santri.dashboard'));

        // Should be rejected by the inactive middleware or auth, expecting redirect to login
        $response->assertRedirect(route('login'));
    }
}

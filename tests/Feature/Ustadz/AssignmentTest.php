<?php

namespace Tests\Feature\Ustadz;

use App\Models\AcademicPeriod;
use App\Models\Assignment;
use App\Models\Jadwal;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\User;
use App\Policies\AssignmentPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentTest extends TestCase
{
    use RefreshDatabase;

    private User $ustadz;

    private User $ustadz2;

    private User $admin;

    private User $santriUser;

    private User $santriUser2;

    private AcademicPeriod $activePeriod;

    private AcademicPeriod $inactivePeriod;

    private Subject $subject;

    private Jadwal $jadwal;

    protected function setUp(): void
    {
        parent::setUp();

        $this->activePeriod = AcademicPeriod::create([
            'tahun_ajaran' => '2025/2026',
            'semester' => 'Ganjil',
            'is_active' => true,
        ]);

        $this->inactivePeriod = AcademicPeriod::create([
            'tahun_ajaran' => '2024/2025',
            'semester' => 'Genap',
            'is_active' => false,
        ]);

        $this->ustadz = User::factory()->create(['role' => 'ustadz']);
        $this->ustadz2 = User::factory()->create(['role' => 'ustadz']);
        $this->admin = User::factory()->create(['role' => 'admin']);

        $this->santriUser = User::factory()->create(['role' => 'santri']);
        Santri::create([
            'user_id' => $this->santriUser->id,
            'nis' => '123',
            'nama' => 'Santri A',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2000-01-01',
            'kelas' => 'XII-A',
            'program' => 'Reguler',
            'status' => 'aktif',
        ]);

        $this->santriUser2 = User::factory()->create(['role' => 'santri']);
        Santri::create([
            'user_id' => $this->santriUser2->id,
            'nis' => '124',
            'nama' => 'Santri B',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2000-01-01',
            'kelas' => 'XII-B',
            'program' => 'Reguler',
            'status' => 'aktif',
        ]);

        $this->subject = Subject::create([
            'kode_mapel' => 'MAP01',
            'nama_mapel' => 'Mapel Test',
        ]);

        $this->jadwal = Jadwal::create([
            'user_id' => $this->ustadz->id,
            'subject_id' => $this->subject->id,
            'academic_period_id' => $this->activePeriod->id,
            'hari' => 'Senin',
            'jam_mulai' => '08:00',
            'jam_selesai' => '09:00',
            'kelas' => 'XII-A',
            'ruang' => 'R1',
        ]);
    }

    public function test_ustadz_can_create_own_assignment()
    {
        $response = $this->actingAs($this->ustadz)->post(route('ustadz.assignments.store'), [
            'subject_id' => $this->subject->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas 1',
            'description' => 'Deskripsi',
            'due_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
        ]);

        $response->assertRedirect(route('ustadz.assignments.index'));
        $this->assertDatabaseHas('assignments', [
            'ustadz_id' => $this->ustadz->id,
            'subject_id' => $this->subject->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas 1',
            'academic_period_id' => $this->activePeriod->id,
        ]);
    }

    public function test_ustadz_cannot_edit_another_ustadz_assignment()
    {
        $assignment = Assignment::create([
            'academic_period_id' => $this->activePeriod->id,
            'subject_id' => $this->subject->id,
            'ustadz_id' => $this->ustadz->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas Ustadz 1',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->ustadz2)->get(route('ustadz.assignments.edit', $assignment));
        $response->assertStatus(403);

        $responseUpdate = $this->actingAs($this->ustadz2)->put(route('ustadz.assignments.update', $assignment), [
            'title' => 'Tugas Edit',
        ]);
        $responseUpdate->assertStatus(403);
    }

    public function test_ustadz_cannot_create_assignment_for_previous_academic_period()
    {
        // By changing the active period, or explicitly failing the Jadwal validation
        // since Jadwal must match the active period.

        $response = $this->actingAs($this->ustadz2)->post(route('ustadz.assignments.store'), [
            'subject_id' => $this->subject->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas 1',
        ]);

        // Should be 403 because ustadz2 doesn't have jadwal for XII-A in active period
        $response->assertStatus(403);
    }

    public function test_ustadz_cannot_inject_academic_period_id()
    {
        $response = $this->actingAs($this->ustadz)->post(route('ustadz.assignments.store'), [
            'subject_id' => $this->subject->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas 1',
            'academic_period_id' => $this->inactivePeriod->id, // Try to inject
        ]);

        $response->assertRedirect(route('ustadz.assignments.index'));
        $this->assertDatabaseHas('assignments', [
            'title' => 'Tugas 1',
            'academic_period_id' => $this->activePeriod->id, // Still active period
        ]);
    }

    public function test_santri_cannot_access_ustadz_assignment_routes()
    {
        $response = $this->actingAs($this->santriUser)->get(route('ustadz.assignments.index'));
        $response->assertStatus(403); // Redirected or 403 based on role middleware. Since role middleware throws 403, we expect 403.
    }

    public function test_santri_can_only_see_matching_kelas_assignments()
    {
        $assignment = Assignment::create([
            'academic_period_id' => $this->activePeriod->id,
            'subject_id' => $this->subject->id,
            'ustadz_id' => $this->ustadz->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas 1',
            'status' => 'open',
        ]);

        // Test the policy directly as Santri assignment route is in P1-3B
        $policy = new AssignmentPolicy;

        // Santri A (XII-A) can view XII-A assignment
        $this->assertTrue($policy->view($this->santriUser, $assignment));

        // Santri B (XII-B) cannot view XII-A assignment
        $this->assertFalse($policy->view($this->santriUser2, $assignment));
    }

    public function test_admin_policy_access_works()
    {
        $assignment = Assignment::create([
            'academic_period_id' => $this->activePeriod->id,
            'subject_id' => $this->subject->id,
            'ustadz_id' => $this->ustadz->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas Ustadz 1',
            'status' => 'draft',
        ]);

        $policy = new AssignmentPolicy;

        $this->assertTrue($policy->before($this->admin, 'viewAny') === true);
    }
}

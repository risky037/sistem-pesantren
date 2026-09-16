<?php

namespace Tests\Feature\Ustadz;

use App\Models\AcademicPeriod;
use App\Models\Assignment;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmissionAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $ustadzA;

    private User $ustadzB;

    private User $santriUser;

    private Santri $santri;

    private AcademicPeriod $activePeriod;

    private Assignment $assignmentA;

    private Assignment $assignmentB;

    private Submission $submissionA;

    protected function setUp(): void
    {
        parent::setUp();

        $this->activePeriod = AcademicPeriod::create([
            'tahun_ajaran' => '2025/2026',
            'semester' => 'Ganjil',
            'is_active' => true,
        ]);

        $this->ustadzA = User::factory()->create(['role' => 'ustadz']);
        $this->ustadzB = User::factory()->create(['role' => 'ustadz']);

        $this->santriUser = User::factory()->create(['role' => 'santri']);
        $this->santri = Santri::create([
            'user_id' => $this->santriUser->id,
            'nis' => '123',
            'nama' => 'Santri A',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2000-01-01',
            'kelas' => 'XII-A',
            'program' => 'Reguler',
            'status' => 'aktif',
        ]);

        $subject = Subject::create([
            'kode_mapel' => 'MAP01',
            'nama_mapel' => 'Mapel Test',
        ]);

        $this->assignmentA = Assignment::create([
            'academic_period_id' => $this->activePeriod->id,
            'subject_id' => $subject->id,
            'ustadz_id' => $this->ustadzA->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas Ustadz A',
            'status' => 'open',
            'due_date' => now()->addDays(2),
        ]);

        $this->assignmentB = Assignment::create([
            'academic_period_id' => $this->activePeriod->id,
            'subject_id' => $subject->id,
            'ustadz_id' => $this->ustadzB->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas Ustadz B',
            'status' => 'open',
            'due_date' => now()->addDays(2),
        ]);

        $this->submissionA = Submission::create([
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santri->id,
            'content' => 'Content for A',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }

    public function test_ustadz_can_view_own_assignment_submissions()
    {
        $response = $this->actingAs($this->ustadzA)->get(route('ustadz.assignments.submissions.index', $this->assignmentA));
        $response->assertStatus(200);
    }

    public function test_ustadz_cannot_view_other_ustadz_submissions()
    {
        $response = $this->actingAs($this->ustadzB)->get(route('ustadz.assignments.submissions.index', $this->assignmentA));
        $response->assertStatus(403);
    }
}

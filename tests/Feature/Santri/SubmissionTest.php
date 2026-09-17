<?php

namespace Tests\Feature\Santri;

use App\Models\AcademicPeriod;
use App\Models\Assignment;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmissionTest extends TestCase
{
    use RefreshDatabase;

    private User $ustadz;

    private User $santriUserA;

    private User $santriUserB;

    private Santri $santriA;

    private Santri $santriB;

    private AcademicPeriod $activePeriod;

    private AcademicPeriod $inactivePeriod;

    private Assignment $assignmentA;

    private Assignment $assignmentB;

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

        $this->santriUserA = User::factory()->create(['role' => 'santri']);
        $this->santriA = Santri::create([
            'user_id' => $this->santriUserA->id,
            'nis' => '123',
            'nama' => 'Santri A',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2000-01-01',
            'kelas' => 'XII-A',
            'program' => 'Reguler',
            'status' => 'aktif',
        ]);

        $this->santriUserB = User::factory()->create(['role' => 'santri']);
        $this->santriB = Santri::create([
            'user_id' => $this->santriUserB->id,
            'nis' => '124',
            'nama' => 'Santri B',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2000-01-01',
            'kelas' => 'XII-B',
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
            'ustadz_id' => $this->ustadz->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas XII-A',
            'status' => 'open',
            'due_date' => now()->addDays(2),
        ]);

        $this->assignmentB = Assignment::create([
            'academic_period_id' => $this->activePeriod->id,
            'subject_id' => $subject->id,
            'ustadz_id' => $this->ustadz->id,
            'kelas' => 'XII-B',
            'title' => 'Tugas XII-B',
            'status' => 'open',
            'due_date' => now()->addDays(2),
        ]);
    }

    public function test_santri_cannot_submit_another_class_assignment()
    {
        $response = $this->actingAs($this->santriUserA)->post(route('santri.submissions.store', $this->assignmentB), [
            'content' => 'My submission content',
        ]);

        $response->assertSessionHasErrors(['assignment_id']);
    }

    public function test_inactive_assignment_cannot_receive_submission()
    {
        $inactiveAssignment = Assignment::create([
            'academic_period_id' => $this->inactivePeriod->id,
            'subject_id' => $this->assignmentA->subject_id,
            'ustadz_id' => $this->ustadz->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas Lama',
            'status' => 'open',
            'due_date' => now()->subDays(2),
        ]);

        $response = $this->actingAs($this->santriUserA)->post(route('santri.submissions.store', $inactiveAssignment), [
            'content' => 'My submission content',
        ]);

        $response->assertSessionHasErrors(['assignment_id']);
    }

    public function test_santri_id_payload_cannot_change_ownership()
    {
        $response = $this->actingAs($this->santriUserA)->post(route('santri.submissions.store', $this->assignmentA), [
            'content' => 'My submission content',
            'santri_id' => $this->santriB->id, // Attempt to inject
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('submissions', [
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santriA->id, // Should use the authenticated santri
        ]);
    }

    public function test_duplicate_submission_prevented()
    {
        Submission::create([
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santriA->id,
            'content' => 'First content',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->santriUserA)->post(route('santri.submissions.store', $this->assignmentA), [
            'content' => 'Second content',
        ]);

        $response->assertSessionHasErrors(['assignment_id']);
        $this->assertEquals(1, Submission::where('assignment_id', $this->assignmentA->id)->where('santri_id', $this->santriA->id)->count());
    }

    public function test_draft_can_update()
    {
        $submission = Submission::create([
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santriA->id,
            'content' => 'First content',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->santriUserA)->put(route('santri.submissions.update', $submission), [
            'content' => 'Updated content',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals('Updated content', $submission->fresh()->content);
    }

    public function test_submitted_cannot_update()
    {
        $submission = Submission::create([
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santriA->id,
            'content' => 'First content',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($this->santriUserA)->put(route('santri.submissions.update', $submission), [
            'content' => 'Updated content',
        ]);

        $response->assertStatus(403);
        $this->assertEquals('First content', $submission->fresh()->content);
    }

    public function test_draft_cannot_update_if_academic_period_inactive()
    {
        $inactiveAssignment = Assignment::create([
            'academic_period_id' => $this->inactivePeriod->id,
            'subject_id' => $this->assignmentA->subject_id,
            'ustadz_id' => $this->ustadz->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas Lama',
            'status' => 'open',
            'due_date' => now()->addDays(2),
        ]);

        $submission = Submission::create([
            'assignment_id' => $inactiveAssignment->id,
            'santri_id' => $this->santriA->id,
            'content' => 'First content',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->santriUserA)->put(route('santri.submissions.update', $submission), [
            'content' => 'Updated content',
        ]);

        $response->assertStatus(403);
    }

    public function test_draft_can_submit()
    {
        $submission = Submission::create([
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santriA->id,
            'content' => 'First content',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->santriUserA)->post(route('santri.submissions.submit', $submission));

        $response->assertSessionHasNoErrors();
        $this->assertEquals('submitted', $submission->fresh()->status);
        $this->assertNotNull($submission->fresh()->submitted_at);
    }

    public function test_submitted_cannot_submit_again()
    {
        $submission = Submission::create([
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santriA->id,
            'content' => 'First content',
            'status' => 'submitted',
            'submitted_at' => now()->subDay(),
        ]);

        $originalTime = $submission->submitted_at;

        $response = $this->actingAs($this->santriUserA)->post(route('santri.submissions.submit', $submission));

        $response->assertStatus(403);
        $this->assertEquals($originalTime->timestamp, $submission->fresh()->submitted_at->timestamp);
    }

    public function test_draft_cannot_submit_if_academic_period_inactive()
    {
        $inactiveAssignment = Assignment::create([
            'academic_period_id' => $this->inactivePeriod->id,
            'subject_id' => $this->assignmentA->subject_id,
            'ustadz_id' => $this->ustadz->id,
            'kelas' => 'XII-A',
            'title' => 'Tugas Lama',
            'status' => 'open',
            'due_date' => now()->addDays(2),
        ]);

        $submission = Submission::create([
            'assignment_id' => $inactiveAssignment->id,
            'santri_id' => $this->santriA->id,
            'content' => 'First content',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->santriUserA)->post(route('santri.submissions.submit', $submission));

        $response->assertStatus(403);
    }

    public function test_santri_cannot_view_another_santri_submission()
    {
        $submissionA = Submission::create([
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santriA->id,
            'content' => 'Santri A content',
            'status' => 'draft',
        ]);

        // Attempting to update or submit someone else's submission
        $response = $this->actingAs($this->santriUserB)->put(route('santri.submissions.update', $submissionA), [
            'content' => 'Hacked content',
        ]);

        $response->assertStatus(403);
    }

    public function test_update_submission_request_rejects_non_santri()
    {
        $submission = Submission::create([
            'assignment_id' => $this->assignmentA->id,
            'santri_id' => $this->santriA->id,
            'content' => 'Content',
            'status' => 'draft',
        ]);

        // Ustadz attempting to update a santri's submission
        $response = $this->actingAs($this->ustadz)->put(route('santri.submissions.update', $submission), [
            'content' => 'Ustadz tampered content',
        ]);

        $response->assertStatus(403);
    }

    public function test_santri_can_access_assignments_index()
    {
        $response = $this->actingAs($this->santriUserA)->get(route('santri.assignments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Santri/Assignment/Index')
            ->has('assignments')
        );
    }

    public function test_santri_can_access_assignments_show_contract()
    {
        $response = $this->actingAs($this->santriUserA)->get(route('santri.assignments.show', $this->assignmentA));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Santri/Assignment/Show')
            ->has('assignment')
            ->has('submission')
        );
    }
}

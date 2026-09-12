<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Jadwal;
use App\Models\Materi;
use App\Models\Penilaian;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UstadzLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $ustadz;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $this->ustadz = User::factory()->create(['role' => UserRole::Ustadz->value]);
    }

    public function test_admin_can_deactivate_ustadz(): void
    {
        $response = $this->actingAs($this->admin)->post("/admin/ustadz/{$this->ustadz->id}/deactivate");

        $response->assertRedirect('/admin/ustadz');
        $this->assertFalse($this->ustadz->fresh()->is_active);
    }

    public function test_admin_can_reactivate_ustadz(): void
    {
        $this->ustadz->update(['is_active' => false]);

        $response = $this->actingAs($this->admin)->post("/admin/ustadz/{$this->ustadz->id}/reactivate");

        $response->assertRedirect('/admin/ustadz');
        $this->assertTrue($this->ustadz->fresh()->is_active);
    }

    public function test_ustadz_cannot_deactivate_another_account(): void
    {
        $otherUstadz = User::factory()->create(['role' => UserRole::Ustadz->value]);

        $response = $this->actingAs($this->ustadz)->post("/admin/ustadz/{$otherUstadz->id}/deactivate");

        $response->assertStatus(403);
        $this->assertTrue($otherUstadz->fresh()->is_active);
    }

    public function test_guest_cannot_deactivate_account(): void
    {
        $response = $this->post("/admin/ustadz/{$this->ustadz->id}/deactivate");

        $response->assertRedirect('/login');
    }

    public function test_admin_cannot_deactivate_non_ustadz_user(): void
    {
        $otherAdmin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($this->admin)->post("/admin/ustadz/{$otherAdmin->id}/deactivate");

        $response->assertStatus(404);
        $this->assertTrue($otherAdmin->fresh()->is_active);
    }

    public function test_admin_cannot_delete_ustadz_with_jadwal_records(): void
    {
        $subject = Subject::create(['nama_mapel' => 'Test', 'kode_mapel' => 'TST', 'tingkat' => '10']);
        Jadwal::create([
            'user_id' => $this->ustadz->id,
            'subject_id' => $subject->id,
            'hari' => 'Senin',
            'jam_mulai' => '08:00',
            'jam_selesai' => '10:00',
            'kelas' => '10A',
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/ustadz/{$this->ustadz->id}");

        $response->assertRedirect('/admin/ustadz');
        $response->assertSessionHas('error');
        $this->assertNotNull($this->ustadz->fresh());
    }

    public function test_admin_cannot_delete_ustadz_with_materi_records(): void
    {
        $subject = Subject::create(['nama_mapel' => 'Test', 'kode_mapel' => 'TST', 'tingkat' => '10']);
        Materi::create([
            'user_id' => $this->ustadz->id,
            'subject_id' => $subject->id,
            'judul' => 'Test Materi',
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/ustadz/{$this->ustadz->id}");

        $response->assertRedirect('/admin/ustadz');
        $response->assertSessionHas('error');
        $this->assertNotNull($this->ustadz->fresh());
    }

    public function test_admin_cannot_delete_ustadz_with_penilaian_records(): void
    {
        $subject = Subject::create(['nama_mapel' => 'Test', 'kode_mapel' => 'TST', 'tingkat' => '10']);
        $santri = \App\Models\Santri::factory()->create([
            'nis' => '12345',
            'nama' => 'Test Santri',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2010-01-01',
            'alamat' => 'Test',
            'kelas' => '10A',
            'program' => 'Tahfidz',
            'status' => 'aktif',
        ]);
        Penilaian::create([
            'user_id' => $this->ustadz->id,
            'subject_id' => $subject->id,
            'santri_id' => $santri->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/ustadz/{$this->ustadz->id}");

        $response->assertRedirect('/admin/ustadz');
        $response->assertSessionHas('error');
        $this->assertNotNull($this->ustadz->fresh());
    }

    public function test_admin_can_delete_ustadz_without_academic_records(): void
    {
        $response = $this->actingAs($this->admin)->delete("/admin/ustadz/{$this->ustadz->id}");

        $response->assertRedirect('/admin/ustadz');
        $response->assertSessionHas('success');
        $this->assertNull($this->ustadz->fresh());
    }
}

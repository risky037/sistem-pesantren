<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Penilaian;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Santri $santri;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
        $this->admin->role = UserRole::Admin->value;
        $this->admin->save();
        $this->santri = Santri::factory()->create([
            'nis' => '12345',
            'nama' => 'Test Santri',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2010-01-01',
            'alamat' => 'Test',
            'kelas' => '10A',
            'program' => 'Tahfidz',
            'status' => 'aktif',
        ]);
    }

    public function test_santri_cannot_be_deleted_with_penilaian_records(): void
    {
        $subject = Subject::create(['nama_mapel' => 'Test', 'kode_mapel' => 'TST', 'tingkat' => '10']);
        $ustadz = User::factory()->create(['role' => UserRole::Ustadz->value]);

        Penilaian::create([
            'user_id' => $ustadz->id,
            'subject_id' => $subject->id,
            'santri_id' => $this->santri->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/santri/{$this->santri->id}");

        $response->assertRedirect('/admin/santri');
        $response->assertSessionHas('error');
        $this->assertNotNull($this->santri->fresh());
    }

    public function test_santri_can_be_deleted_without_penilaian_records(): void
    {
        $response = $this->actingAs($this->admin)->delete("/admin/santri/{$this->santri->id}");

        $response->assertRedirect('/admin/santri');
        $response->assertSessionHas('success');
        $this->assertNull($this->santri->fresh());
    }
}

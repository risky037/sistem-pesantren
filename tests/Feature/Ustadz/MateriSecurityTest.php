<?php

namespace Tests\Feature\Ustadz;

use App\Enums\UserRole;
use App\Models\Materi;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MateriSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_ustadz_cannot_edit_another_ustadz_materi(): void
    {
        $ustadzA = User::factory()->create(['role' => UserRole::Ustadz]);
        $ustadzB = User::factory()->create(['role' => UserRole::Ustadz]);

        $subject = Subject::create(['nama_mapel' => 'Test Subject', 'kode_mapel' => 'TS01']);

        $materiA = Materi::create([
            'user_id' => $ustadzA->id,
            'subject_id' => $subject->id,
            'judul' => 'Materi A',
            'deskripsi' => 'Desc A',
        ]);

        $response = $this->actingAs($ustadzB)->get(route('ustadz.materi.edit', $materiA->id));
        $response->assertStatus(403);
    }

    public function test_ustadz_cannot_update_another_ustadz_materi(): void
    {
        $ustadzA = User::factory()->create(['role' => UserRole::Ustadz]);
        $ustadzB = User::factory()->create(['role' => UserRole::Ustadz]);

        $subject = Subject::create(['nama_mapel' => 'Test Subject', 'kode_mapel' => 'TS01']);

        $materiA = Materi::create([
            'user_id' => $ustadzA->id,
            'subject_id' => $subject->id,
            'judul' => 'Materi A',
            'deskripsi' => 'Desc A',
        ]);

        $response = $this->actingAs($ustadzB)->put(route('ustadz.materi.update', $materiA->id), [
            'subject_id' => $subject->id,
            'judul' => 'Hacked Judul',
            'deskripsi' => 'Hacked Desc',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('materis', [
            'id' => $materiA->id,
            'judul' => 'Materi A',
        ]);
    }

    public function test_ustadz_cannot_delete_another_ustadz_materi(): void
    {
        $ustadzA = User::factory()->create(['role' => UserRole::Ustadz]);
        $ustadzB = User::factory()->create(['role' => UserRole::Ustadz]);

        $subject = Subject::create(['nama_mapel' => 'Test Subject', 'kode_mapel' => 'TS01']);

        $materiA = Materi::create([
            'user_id' => $ustadzA->id,
            'subject_id' => $subject->id,
            'judul' => 'Materi A',
            'deskripsi' => 'Desc A',
        ]);

        $response = $this->actingAs($ustadzB)->delete(route('ustadz.materi.destroy', $materiA->id));
        $response->assertStatus(403);
        $this->assertDatabaseHas('materis', ['id' => $materiA->id]);
    }
}

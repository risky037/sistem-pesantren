<?php

namespace Tests\Feature\Ustadz;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\Materi;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicPeriodAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_ustadz_cannot_update_materi_from_past_period(): void
    {
        $pastPeriod = AcademicPeriod::create(['tahun_ajaran' => '2024/2025', 'semester' => 'Genap', 'is_active' => false]);
        $activePeriod = AcademicPeriod::create(['tahun_ajaran' => '2025/2026', 'semester' => 'Ganjil', 'is_active' => true]);

        $ustadz = User::factory()->create(['role' => UserRole::Ustadz->value]);
        $subject = Subject::create(['kode_mapel' => 'M1', 'nama_mapel' => 'Materi 1']);

        $materi = Materi::create([
            'user_id' => $ustadz->id,
            'subject_id' => $subject->id,
            'academic_period_id' => $pastPeriod->id,
            'judul' => 'Past Materi',
        ]);

        $response = $this->actingAs($ustadz)->put(route('ustadz.materi.update', $materi->id), [
            'judul' => 'Updated',
            'subject_id' => $subject->id,
        ]);

        $response->assertForbidden();
    }
}

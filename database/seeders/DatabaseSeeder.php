<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\AcademicPeriod;
use App\Models\Jadwal;
use App\Models\Materi;
use App\Models\Penilaian;
use App\Models\Santri;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // === Academic Period ===
        $period = AcademicPeriod::create([
            'tahun_ajaran' => '2025/2026',
            'semester' => 'Ganjil',
            'is_active' => true,
        ]);
        $activePeriodId = $period->id;

        // === Users ===
        $admin = User::forceCreate([
            'name' => 'Super Admin',
            'email' => 'admin@pesantren.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::Admin->value,
            'email_verified_at' => now(),
        ]);

        $ustadz = User::forceCreate([
            'name' => 'Ustadz Ahmad Hidayat',
            'email' => 'ustadz@pesantren.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::Ustadz->value,
            'email_verified_at' => now(),
        ]);

        $ustadz2 = User::forceCreate([
            'name' => 'Ustadzah Siti Nurhaliza',
            'email' => 'ustadzah@pesantren.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::Ustadz->value,
            'email_verified_at' => now(),
        ]);

        // === Subjects ===
        $fiqih = Subject::create(['kode_mapel' => 'FIQ001', 'nama_mapel' => 'Fiqih', 'deskripsi' => 'Ilmu Fiqih Islam']);
        $quran = Subject::create(['kode_mapel' => 'QUR002', 'nama_mapel' => "Al-Qur'an", 'deskripsi' => 'Tahfiz dan Tilawah Al-Quran']);
        $hadis = Subject::create(['kode_mapel' => 'HAD003', 'nama_mapel' => 'Hadis', 'deskripsi' => 'Ilmu Hadis dan Musthalah']);
        $akidah = Subject::create(['kode_mapel' => 'AKI004', 'nama_mapel' => 'Akidah', 'deskripsi' => 'Akidah dan Tauhid']);
        $arab = Subject::create(['kode_mapel' => 'ARA005', 'nama_mapel' => 'Bahasa Arab', 'deskripsi' => 'Nahwu, Sharaf, dan Percakapan']);

        // === Santri ===
        $santriData = [
            ['nis' => '2024001', 'nama' => 'Muhammad Rafiqi', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '2008-05-10', 'kelas' => 'XII-A', 'program' => 'Tahfiz', 'status' => 'aktif', 'alamat' => 'Jl. Pesantren No. 1', 'email' => 'rafiqi@pesantren.com'],
            ['nis' => '2024002', 'nama' => 'Siti Mariam', 'jenis_kelamin' => 'P', 'tanggal_lahir' => '2008-08-15', 'kelas' => 'XII-A', 'program' => 'Tahfiz', 'status' => 'aktif', 'alamat' => 'Jl. Pesantren No. 2', 'email' => 'mariam@pesantren.com'],
            ['nis' => '2024003', 'nama' => 'Ahmad Ikhsan', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '2008-03-22', 'kelas' => 'XII-B', 'program' => 'Reguler', 'status' => 'aktif', 'alamat' => 'Jl. Pesantren No. 3', 'email' => 'ikhsan@pesantren.com'],
            ['nis' => '2024004', 'nama' => 'Fatimah Zahra', 'jenis_kelamin' => 'P', 'tanggal_lahir' => '2009-01-05', 'kelas' => 'XI-A', 'program' => 'Hafalan', 'status' => 'aktif', 'email' => 'fatimah@pesantren.com'],
            ['nis' => '2024005', 'nama' => 'Ali Hidayat', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '2009-07-18', 'kelas' => 'XI-A', 'program' => 'Reguler', 'status' => 'aktif', 'email' => 'ali@pesantren.com'],
            ['nis' => '2024006', 'nama' => 'Khadijah Amira', 'jenis_kelamin' => 'P', 'tanggal_lahir' => '2009-11-30', 'kelas' => 'XI-B', 'program' => 'Reguler', 'status' => 'aktif', 'email' => 'khadijah@pesantren.com'],
            ['nis' => '2024007', 'nama' => 'Umar Faruq', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '2008-09-12', 'kelas' => 'XII-B', 'program' => 'Tahfiz', 'status' => 'aktif', 'email' => 'umar@pesantren.com'],
        ];

        $santriModels = [];
        foreach ($santriData as $data) {
            $user = User::forceCreate([
                'name' => $data['nama'],
                'email' => $data['email'],
                'password' => Hash::make('password123'),
                'role' => UserRole::Santri->value,
                'email_verified_at' => now(),
            ]);
            unset($data['email']);
            $data['user_id'] = $user->id;
            $santriModels[] = Santri::create($data);
        }
        $santri1 = $santriModels[0];
        $santri2 = $santriModels[1];

        // === Jadwal ===
        Jadwal::create(['user_id' => $ustadz->id, 'subject_id' => $fiqih->id, 'academic_period_id' => $activePeriodId, 'hari' => 'Senin', 'jam_mulai' => '08:00', 'jam_selesai' => '09:30', 'kelas' => 'XII-A', 'ruang' => 'Ruang 1']);
        Jadwal::create(['user_id' => $ustadz->id, 'subject_id' => $fiqih->id, 'academic_period_id' => $activePeriodId, 'hari' => 'Selasa', 'jam_mulai' => '09:30', 'jam_selesai' => '11:00', 'kelas' => 'XII-B', 'ruang' => 'Ruang 2']);
        Jadwal::create(['user_id' => $ustadz->id, 'subject_id' => $hadis->id, 'academic_period_id' => $activePeriodId, 'hari' => 'Rabu', 'jam_mulai' => '13:00', 'jam_selesai' => '14:30', 'kelas' => 'XI-A', 'ruang' => 'Ruang 3']);
        Jadwal::create(['user_id' => $ustadz2->id, 'subject_id' => $quran->id, 'academic_period_id' => $activePeriodId, 'hari' => 'Senin', 'jam_mulai' => '10:00', 'jam_selesai' => '11:30', 'kelas' => 'XII-A', 'ruang' => 'Ruang 4']);
        Jadwal::create(['user_id' => $ustadz2->id, 'subject_id' => $akidah->id, 'academic_period_id' => $activePeriodId, 'hari' => 'Kamis', 'jam_mulai' => '08:00', 'jam_selesai' => '09:30', 'kelas' => 'XI-A', 'ruang' => 'Ruang 1']);

        // === Penilaian (sample for ustadz + fiqih + XII-A students) ===
        Penilaian::create(['user_id' => $ustadz->id, 'santri_id' => $santri1->id, 'subject_id' => $fiqih->id, 'academic_period_id' => $activePeriodId, 'tugas' => 85, 'uts' => 88, 'uas' => 90, 'nilai_akhir' => 87.67]);
        Penilaian::create(['user_id' => $ustadz->id, 'santri_id' => $santri2->id, 'subject_id' => $fiqih->id, 'academic_period_id' => $activePeriodId, 'tugas' => 78, 'uts' => 82, 'uas' => 85, 'nilai_akhir' => 81.67]);

        // === Materi (sample) ===
        Materi::create(['user_id' => $ustadz->id, 'subject_id' => $fiqih->id, 'academic_period_id' => $activePeriodId, 'judul' => 'Rukun Islam', 'deskripsi' => 'Materi tentang 5 rukun Islam', 'kelas' => 'XII-A', 'published_at' => '2024-01-15']);
        Materi::create(['user_id' => $ustadz->id, 'subject_id' => $hadis->id, 'academic_period_id' => $activePeriodId, 'judul' => 'Hadis Arbain Nawawi', 'deskripsi' => 'Kumpulan 40 hadis pilihan Imam Nawawi', 'kelas' => 'XI-A', 'published_at' => '2024-01-20']);
    }
}

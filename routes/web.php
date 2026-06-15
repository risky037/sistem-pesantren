<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UstadzController;
use App\Http\Controllers\Admin\SantriController as AdminSantriController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\JadwalController as AdminJadwalController;

use App\Http\Controllers\Ustadz\DashboardController as UstadzDashboardController;
use App\Http\Controllers\Ustadz\JadwalController as UstadzJadwalController;
use App\Http\Controllers\Ustadz\SantriController as UstadzSantriController;
use App\Http\Controllers\Ustadz\PenilaianController;
use App\Http\Controllers\Ustadz\MateriController;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Grup Rute Admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Ustadz Management
    Route::get('/ustadz', [UstadzController::class, 'index'])->name('ustadz.index');
    Route::get('/ustadz/create', [UstadzController::class, 'create'])->name('ustadz.create');
    Route::post('/ustadz', [UstadzController::class, 'store'])->name('ustadz.store');
    Route::get('/ustadz/{id}/edit', [UstadzController::class, 'edit'])->name('ustadz.edit');
    Route::put('/ustadz/{id}', [UstadzController::class, 'update'])->name('ustadz.update');
    Route::delete('/ustadz/{id}', [UstadzController::class, 'destroy'])->name('ustadz.destroy');

    // Santri Management
    Route::get('/santri', [AdminSantriController::class, 'index'])->name('santri.index');
    Route::get('/santri/create', [AdminSantriController::class, 'create'])->name('santri.create');
    Route::post('/santri', [AdminSantriController::class, 'store'])->name('santri.store');
    Route::get('/santri/{id}/edit', [AdminSantriController::class, 'edit'])->name('santri.edit');
    Route::put('/santri/{id}', [AdminSantriController::class, 'update'])->name('santri.update');
    Route::delete('/santri/{id}', [AdminSantriController::class, 'destroy'])->name('santri.destroy');

    // Mata Pelajaran Management
    Route::get('/mapel', [SubjectController::class, 'index'])->name('mapel.index');
    Route::get('/mapel/create', [SubjectController::class, 'create'])->name('mapel.create');
    Route::post('/mapel', [SubjectController::class, 'store'])->name('mapel.store');
    Route::get('/mapel/{id}/edit', [SubjectController::class, 'edit'])->name('mapel.edit');
    Route::put('/mapel/{id}', [SubjectController::class, 'update'])->name('mapel.update');
    Route::delete('/mapel/{id}', [SubjectController::class, 'destroy'])->name('mapel.destroy');

    // Jadwal Management
    Route::get('/jadwal', [AdminJadwalController::class, 'index'])->name('jadwal.index');
    Route::get('/jadwal/create', [AdminJadwalController::class, 'create'])->name('jadwal.create');
    Route::post('/jadwal', [AdminJadwalController::class, 'store'])->name('jadwal.store');
    Route::get('/jadwal/{id}/edit', [AdminJadwalController::class, 'edit'])->name('jadwal.edit');
    Route::put('/jadwal/{id}', [AdminJadwalController::class, 'update'])->name('jadwal.update');
    Route::delete('/jadwal/{id}', [AdminJadwalController::class, 'destroy'])->name('jadwal.destroy');
});

// Grup Rute Ustadz
Route::middleware(['auth', 'role:ustadz'])->prefix('ustadz')->name('ustadz.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [UstadzDashboardController::class, 'index'])->name('dashboard');

    // Jadwal Mengajar
    Route::get('/jadwal', [UstadzJadwalController::class, 'index'])->name('jadwal.index');

    // Data Santri
    Route::get('/santri', [UstadzSantriController::class, 'index'])->name('santri.index');
    Route::get('/santri/{id}/detail', [UstadzSantriController::class, 'detail'])->name('santri.detail');

    // Penilaian
    Route::get('/penilaian', [PenilaianController::class, 'index'])->name('penilaian.index');
    Route::get('/penilaian/{id}/input', [PenilaianController::class, 'input'])->name('penilaian.input');
    Route::post('/penilaian/{id}', [PenilaianController::class, 'store'])->name('penilaian.store');

    // Materi Ajar
    Route::get('/materi', [MateriController::class, 'index'])->name('materi.index');
    Route::get('/materi/create', [MateriController::class, 'create'])->name('materi.create');
    Route::post('/materi', [MateriController::class, 'store'])->name('materi.store');
    Route::get('/materi/{id}/edit', [MateriController::class, 'edit'])->name('materi.edit');
    Route::put('/materi/{id}', [MateriController::class, 'update'])->name('materi.update');
    Route::delete('/materi/{id}', [MateriController::class, 'destroy'])->name('materi.destroy');
});

// Profile Routes (Breeze)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

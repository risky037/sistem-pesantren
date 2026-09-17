<?php

use App\Http\Controllers\Admin\AcademicPeriodController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\JadwalController as AdminJadwalController;
use App\Http\Controllers\Admin\SantriController as AdminSantriController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\UstadzController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Santri\DashboardController;
use App\Http\Controllers\Santri\GradeController;
use App\Http\Controllers\Santri\ScheduleController;
use App\Http\Controllers\Ustadz\AssignmentController;
use App\Http\Controllers\Ustadz\DashboardController as UstadzDashboardController;
use App\Http\Controllers\Ustadz\JadwalController as UstadzJadwalController;
use App\Http\Controllers\Ustadz\MateriController;
use App\Http\Controllers\Ustadz\PenilaianController;
use App\Http\Controllers\Ustadz\SantriController as UstadzSantriController;
use App\Http\Controllers\Ustadz\SubmissionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Grup Rute Admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Academic Period Management
    Route::get('/academic-period', [AcademicPeriodController::class, 'index'])->name('academic-period.index');
    Route::get('/academic-period/create', [AcademicPeriodController::class, 'create'])->name('academic-period.create');
    Route::post('/academic-period', [AcademicPeriodController::class, 'store'])->name('academic-period.store');
    Route::get('/academic-period/{academic_period}/edit', [AcademicPeriodController::class, 'edit'])->name('academic-period.edit');
    Route::put('/academic-period/{academic_period}', [AcademicPeriodController::class, 'update'])->name('academic-period.update');
    Route::delete('/academic-period/{academic_period}', [AcademicPeriodController::class, 'destroy'])->name('academic-period.destroy');
    Route::post('/academic-period/{academic_period}/activate', [AcademicPeriodController::class, 'activate'])->name('academic-period.activate');

    // Ustadz Management
    Route::get('/ustadz', [UstadzController::class, 'index'])->name('ustadz.index');
    Route::get('/ustadz/create', [UstadzController::class, 'create'])->name('ustadz.create');
    Route::post('/ustadz', [UstadzController::class, 'store'])->name('ustadz.store');
    Route::get('/ustadz/{id}/edit', [UstadzController::class, 'edit'])->name('ustadz.edit');
    Route::put('/ustadz/{id}', [UstadzController::class, 'update'])->name('ustadz.update');
    Route::post('/ustadz/{id}/reset-password', [UstadzController::class, 'resetPassword'])->name('ustadz.reset-password');
    Route::post('/ustadz/{id}/deactivate', [UstadzController::class, 'deactivate'])->name('ustadz.deactivate');
    Route::post('/ustadz/{id}/reactivate', [UstadzController::class, 'reactivate'])->name('ustadz.reactivate');
    Route::delete('/ustadz/{id}', [UstadzController::class, 'destroy'])->name('ustadz.destroy');

    // Santri Management
    Route::get('/santri', [AdminSantriController::class, 'index'])->name('santri.index');
    Route::get('/santri/create', [AdminSantriController::class, 'create'])->name('santri.create');
    Route::post('/santri', [AdminSantriController::class, 'store'])->name('santri.store');
    Route::get('/santri/{id}/edit', [AdminSantriController::class, 'edit'])->name('santri.edit');
    Route::put('/santri/{id}', [AdminSantriController::class, 'update'])->name('santri.update');
    Route::post('/santri/{id}/reset-password', [AdminSantriController::class, 'resetPassword'])->name('santri.reset-password');
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

// / Grup Rute Ustadz
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

    // LMS Assignments (Ustadz)
    Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');
    Route::get('/assignments/create', [AssignmentController::class, 'create'])->name('assignments.create');
    Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
    Route::get('/assignments/{assignment}/edit', [AssignmentController::class, 'edit'])->name('assignments.edit');
    Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
    Route::patch('/assignments/{assignment}/open', [AssignmentController::class, 'open'])->name('assignments.open');
    Route::patch('/assignments/{assignment}/close', [AssignmentController::class, 'close'])->name('assignments.close');

    // LMS Submissions (Ustadz)
    Route::get('/assignments/{assignment}/submissions', [SubmissionController::class, 'index'])->name('assignments.submissions.index');
});

// Profile Routes (Breeze)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

// Grup Rute Santri
Route::middleware(['auth', 'role:santri'])->prefix('santri')->name('santri.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule');
    Route::get('/grades', [GradeController::class, 'index'])->name('grades');

    // LMS Assignments (Santri)
    Route::get('/assignments', [App\Http\Controllers\Santri\AssignmentController::class, 'index'])->name('assignments.index');
    Route::get('/assignments/{assignment}', [App\Http\Controllers\Santri\AssignmentController::class, 'show'])->name('assignments.show');

    // LMS Submissions (Santri)
    Route::get('/submissions', [App\Http\Controllers\Santri\SubmissionController::class, 'index'])->name('submissions.index');
    Route::get('/assignments/{assignment}/submission', [App\Http\Controllers\Santri\SubmissionController::class, 'create'])->name('assignments.submission.create');
    Route::post('/assignments/{assignment}/submissions', [App\Http\Controllers\Santri\SubmissionController::class, 'store'])->name('submissions.store');
    Route::put('/submissions/{submission}', [App\Http\Controllers\Santri\SubmissionController::class, 'update'])->name('submissions.update');
    Route::post('/submissions/{submission}/submit', [App\Http\Controllers\Santri\SubmissionController::class, 'submit'])->name('submissions.submit');
});

require __DIR__.'/auth.php';

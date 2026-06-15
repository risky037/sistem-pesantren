<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Grup Rute Admin
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->middleware('role:admin')->name('dashboard');

    // Ustadz Management
    Route::get('/ustadz', function () {
        return Inertia::render('Admin/Ustadz/Index');
    })->middleware('role:admin')->name('ustadz.index');
    
    Route::get('/ustadz/create', function () {
        return Inertia::render('Admin/Ustadz/Create');
    })->middleware('role:admin')->name('ustadz.create');
    
    Route::get('/ustadz/{id}/edit', function ($id) {
        return Inertia::render('Admin/Ustadz/Edit', ['id' => $id]);
    })->middleware('role:admin')->name('ustadz.edit');

    // Santri Management
    Route::get('/santri', function () {
        return Inertia::render('Admin/Santri/Index');
    })->middleware('role:admin')->name('santri.index');
    
    Route::get('/santri/create', function () {
        return Inertia::render('Admin/Santri/Create');
    })->middleware('role:admin')->name('santri.create');
    
    Route::get('/santri/{id}/edit', function ($id) {
        return Inertia::render('Admin/Santri/Edit', ['id' => $id]);
    })->middleware('role:admin')->name('santri.edit');

    // Mata Pelajaran Management
    Route::get('/mapel', function () {
        return Inertia::render('Admin/MapelClass/Index');
    })->middleware('role:admin')->name('mapel.index');
    
    Route::get('/mapel/create', function () {
        return Inertia::render('Admin/MapelClass/Create');
    })->middleware('role:admin')->name('mapel.create');
    
    Route::get('/mapel/{id}/edit', function ($id) {
        return Inertia::render('Admin/MapelClass/Edit', ['id' => $id]);
    })->middleware('role:admin')->name('mapel.edit');

    // Jadwal Management
    Route::get('/jadwal', function () {
        return Inertia::render('Admin/Jadwal/Index');
    })->middleware('role:admin')->name('jadwal.index');
    
    Route::get('/jadwal/create', function () {
        return Inertia::render('Admin/Jadwal/Create');
    })->middleware('role:admin')->name('jadwal.create');
    
    Route::get('/jadwal/{id}/edit', function ($id) {
        return Inertia::render('Admin/Jadwal/Edit', ['id' => $id]);
    })->middleware('role:admin')->name('jadwal.edit');
});

// Grup Rute Ustadz
Route::middleware(['auth'])->prefix('ustadz')->name('ustadz.')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Ustadz/Dashboard');
    })->middleware('role:ustadz')->name('dashboard');

    // Jadwal Mengajar
    Route::get('/jadwal', function () {
        return Inertia::render('Ustadz/Jadwal/Index');
    })->middleware('role:ustadz')->name('jadwal.index');

    // Data Santri
    Route::get('/santri', function () {
        return Inertia::render('Ustadz/Santri/Index');
    })->middleware('role:ustadz')->name('santri.index');
    
    Route::get('/santri/{id}/detail', function ($id) {
        return Inertia::render('Ustadz/Santri/Detail', ['id' => $id]);
    })->middleware('role:ustadz')->name('santri.detail');

    // Penilaian
    Route::get('/penilaian', function () {
        return Inertia::render('Ustadz/Penilaian/Index');
    })->middleware('role:ustadz')->name('penilaian.index');
    
    Route::get('/penilaian/{id}/input', function ($id) {
        return Inertia::render('Ustadz/Penilaian/Input', ['id' => $id]);
    })->middleware('role:ustadz')->name('penilaian.input');

    // Materi Ajar
    Route::get('/materi', function () {
        return Inertia::render('Ustadz/Materi/Index');
    })->middleware('role:ustadz')->name('materi.index');
    
    Route::get('/materi/create', function () {
        return Inertia::render('Ustadz/Materi/Create');
    })->middleware('role:ustadz')->name('materi.create');
    
    Route::get('/materi/{id}/edit', function ($id) {
        return Inertia::render('Ustadz/Materi/Edit', ['id' => $id]);
    })->middleware('role:ustadz')->name('materi.edit');
});

// Profile Routes (Breeze)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

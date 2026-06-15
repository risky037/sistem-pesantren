<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Akun Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@pesantren.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Akun Ustadz
        User::create([
            'name' => 'Ustadz Fulan',
            'email' => 'ustadz@pesantren.com',
            'password' => Hash::make('password123'),
            'role' => 'ustadz',
            'email_verified_at' => now(),
        ]);
    }
}
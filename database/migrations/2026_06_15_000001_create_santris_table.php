<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('santris', function (Blueprint $table) {
            $table->id();
            $table->string('nis')->unique();
            $table->string('nama');
            $table->string('jenis_kelamin');
            $table->date('tanggal_lahir')->nullable();
            $table->text('alamat')->nullable();
            $table->string('kelas');
            $table->string('program')->nullable();
            $table->string('status')->default('aktif');
            $table->string('email')->nullable();
            $table->string('telepon')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('santris');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->foreignId('subject_id')->constrained()->onDelete('restrict');
            $table->foreignId('academic_period_id')->constrained()->onDelete('restrict');
            $table->string('hari');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->string('kelas');
            $table->string('ruang')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'subject_id', 'kelas', 'hari', 'jam_mulai', 'academic_period_id'], 'jadwal_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwals');
    }
};

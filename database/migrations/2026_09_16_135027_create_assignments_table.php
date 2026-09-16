<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();

            // Teaching-scope composite (mirrors jadwals ownership pattern)
            $table->foreignId('academic_period_id')
                ->constrained()->onDelete('restrict');
            $table->foreignId('subject_id')
                ->constrained()->onDelete('restrict');
            $table->foreignId('ustadz_id')
                ->references('id')->on('users')->onDelete('restrict');
            $table->string('kelas', 50);   // validated against config('pesantren.kelas_allowed')

            // Assignment content
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->dateTime('due_date')->nullable();   // null = no deadline

            // Lifecycle: 'draft' | 'open' | 'closed'
            $table->string('status', 20)->default('draft');

            $table->timestamps();

            // Indexes
            $table->index('academic_period_id');
            $table->index(['ustadz_id', 'academic_period_id']);
            $table->index(['subject_id', 'kelas', 'academic_period_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};

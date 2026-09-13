<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use Illuminate\Support\Facades\DB;

class AcademicPeriodService
{
    public function setActivePeriod(AcademicPeriod $period): void
    {
        DB::transaction(function () use ($period) {
            AcademicPeriod::where('is_active', true)->lockForUpdate()->update(['is_active' => false]);

            $period->is_active = true;
            $period->save();
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'santri_id',
        'content',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Assignment, $this>
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * @return BelongsTo<Santri, $this>
     */
    public function santri(): BelongsTo
    {
        return $this->belongsTo(Santri::class);
    }

    protected function isLate(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->submitted_at ? $this->submitted_at->greaterThan($this->assignment->due_date) : false,
        );
    }
}

# P1-3 LMS Foundation Implementation Plan

**Date:** 2026-09-15
**Branch:** `feature/p1-lms-architecture-refinement`
**Status:** PLANNING — Awaiting Stakeholder Approval Before Implementation
**Architecture Reference:** `docs/references/p1_lms_architecture.md`
**Refinement Reference:** `docs/references/p1_lms_architecture_refinement_summary.md`

---

## Notation

- **[NEW]** — File to be created.
- **[MODIFY]** — Existing file to be modified.
- **[GATE]** — Step that must complete before the next milestone begins.

---

## Repository Baseline

- **Test suite:** 90 tests, 90 passed, 251 assertions — 100% passing.
- **Stack:** Laravel 13 / PHP 8.4 / Inertia v2 / React 18 / Tailwind CSS 3.4.
- **Existing patterns referenced:** `MateriController`, `MateriPolicy`, `StoreMateriRequest`, `StorePenilaianRequest`, `PenilaianPolicy`.
- **Config:** `config/pesantren.php` → `kelas_allowed`: `['X-A', 'X-B', 'XI-A', 'XI-B', 'XII-A', 'XII-B']`.
- **`AcademicPeriod::requireActive()`** — canonical method for active period resolution. Throws `RuntimeException` if no active period.

---

## Stakeholder Decisions Required Before Implementation

> [!IMPORTANT]
> The following open items block specific implementation steps. Engineering defaults are documented for each.

| ID | Question | Engineering Default | Blocks |
|---|---|---|---|
| **O6** | Edit-after-submit behavior: Can Santri update their submission after it is finalized? | Submitted submissions are immutable unless future workflow changes. Lateness is derived from `submitted_at > due_date`. | `StoreSubmissionRequest`, `SubmissionPolicy::update` |
| **O7** | Is an `open` assignment visible to all Santri in matching `kelas`, or only those with an active Jadwal row? | All Santri whose `santris.kelas` matches `assignments.kelas`. | `AssignmentPolicy::view()` for Santri |
| **O8** | Does Admin need a dedicated assignment management UI in P1-3? | No Admin LMS UI in P1-3. Admin has policy-level full access through `before()`. | P1-3A Admin controller scope |
| **O9** | Is file upload required in P1-3, or is text-only submission the initial release? | Text-only submission (MVP default). `file_path` column excluded from initial migration. | P1-3B schema, P1-3C frontend |

---

## Dependency Overview

```
[EXISTING] academic_periods, subjects, jadwals, santris, users
                            │
            ┌───────────────┘
            │
     ┌──────▼──────┐
     │   P1-3A     │  assignments migration + model + policy + Ustadz CRUD
     │ Assignment  │  + form requests + routes + tests
     │ Foundation  │
     └──────┬──────┘
            │  [GATE: P1-3A merged + tests green]
            │
     ┌──────▼──────┐
     │   P1-3B     │  submissions migration + model + policy
     │ Submission  │  + form requests + Santri/Ustadz submission controllers
     │ Foundation  │  + routes + tests
     └──────┬──────┘
            │  [GATE: P1-3B merged + tests green]
            │
     ┌──────▼──────┐
     │   P1-3C     │  Inertia/React pages for Ustadz and Santri
     │  LMS UI     │  + submission form + integration tests
     │ Foundation  │
     └─────────────┘
```

Each milestone is an independently committable PR. All existing 90+ tests must remain green after each step.

---

## Milestone P1-3A: Assignment Foundation

**Goal:** Establish the `assignments` table, `Assignment` model, `AssignmentPolicy`, Ustadz CRUD controllers, and all form requests. Santri visibility rules are enforced in the policy. No frontend pages in this milestone.

**PR size estimate:** 1 PR.

---

### A1. Database Changes

#### [NEW] `database/migrations/create_assignments_table.php`

```
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
```

**Migration dependency:** `academic_periods`, `subjects`, `users` must exist (all existing).

**Post-migration command:** `php artisan migrate:fresh --seed`

**Seeder addition (to `DatabaseSeeder`):**

```php
// Seed one draft and one open assignment for the active period
Assignment::create([
    'academic_period_id' => $activePeriodId,
    'subject_id'         => $fiqih->id,
    'ustadz_id'          => $ustadz->id,
    'kelas'              => 'XII-A',
    'title'              => 'Tugas Fiqih 1 - Rukun Sholat',
    'description'        => 'Jelaskan rukun sholat secara lengkap.',
    'due_date'           => now()->addDays(7),
    'status'             => 'draft',
]);

Assignment::create([
    'academic_period_id' => $activePeriodId,
    'subject_id'         => $hadis->id,
    'ustadz_id'          => $ustadz->id,
    'kelas'              => 'XI-A',
    'title'              => 'Hafalan Hadis Arbain 1',
    'description'        => 'Hafalkan hadis pertama Arbain Nawawi.',
    'due_date'           => now()->addDays(14),
    'status'             => 'open',
]);
```

---

### A2. Model

#### [NEW] `app/Models/Assignment.php`

```php
// Key implementation notes:
// - $fillable: academic_period_id, subject_id, ustadz_id, kelas, title,
//              description, due_date, status
// - $casts: due_date => 'datetime'
// - Relationships:
//     academicPeriod() → belongsTo(AcademicPeriod::class)
//     subject()        → belongsTo(Subject::class)
//     ustadz()         → belongsTo(User::class, 'ustadz_id')
//     submissions()    → hasMany(Submission::class)   [loaded in P1-3B]
// - Accessor: isDraft(), isOpen(), isClosed() helpers for readability
```

#### [MODIFY] `database/seeders/DatabaseSeeder.php`

Add `use App\Models\Assignment;` and seed entries as described in A1.

---

### A3. Authorization — AssignmentPolicy

#### [NEW] `app/Policies/AssignmentPolicy.php`

```
Command: php artisan make:policy AssignmentPolicy --model=Assignment
```

**Policy implementation:**

```
before(User $user, string $ability): ?bool
  Admin → return true    // full access, all periods, all assignments
  Others → return null   // fall through

viewAny(User $user): bool
  Ustadz → true
  Santri → true (controller filters to kelas/period)
  Others → false

view(User $user, Assignment $assignment): bool
  Ustadz → $user->id === $assignment->ustadz_id
  Santri → $user->santri
            && $user->santri->kelas === $assignment->kelas
            && $assignment->status === 'open'
            && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
  Others → false

  NOTE (O7): If stakeholder requires Jadwal-membership check for Santri visibility,
  add: Jadwal::where('user_id', ...) check here. Default: kelas-string match only.

create(User $user): bool
  Ustadz → true  (teaching-scope validated in StoreAssignmentRequest::authorize())
  Others → false

update(User $user, Assignment $assignment): bool
  Ustadz → $user->id === $assignment->ustadz_id
            && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
            && $assignment->status === 'draft'   // can only edit while still draft
  Others → false

delete(User $user, Assignment $assignment): bool
  Ustadz → $user->id === $assignment->ustadz_id
            && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
            && $assignment->status === 'draft'   // cannot delete open or closed
  Others → false

open(User $user, Assignment $assignment): bool
  // Transitions draft → open (makes assignment visible to Santri)
  Ustadz → $user->id === $assignment->ustadz_id
            && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
            && $assignment->status === 'draft'
  Others → false

close(User $user, Assignment $assignment): bool
  // Transitions open → closed (stops accepting submissions)
  Ustadz → $user->id === $assignment->ustadz_id
            && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
            && $assignment->status === 'open'
  Others → false
```

**Registration:** Laravel auto-discovery via `app/Providers/AppServiceProvider.php` — no manual `$policies` array required (consistent with `MateriPolicy`, `PenilaianPolicy`).

---

### A4. Form Requests

#### [NEW] `app/Http/Requests/StoreAssignmentRequest.php`

```
authorize():
  Verifies $this->user()->can('create', Assignment::class)
  AND validates teaching scope:
    Jadwal::where('user_id', $this->user()->id)
           ->where('subject_id', $this->input('subject_id'))
           ->where('kelas', $this->input('kelas'))
           ->where('academic_period_id', AcademicPeriod::requireActive()->id)
           ->exists()
  → Mirrors StorePenilaianRequest::authorize() pattern exactly.

rules():
  subject_id   → required | exists:subjects,id
  kelas        → required | string | in:config('pesantren.kelas_allowed')
  title        → required | string | max:255
  description  → nullable | string
  due_date     → nullable | date | after:now

SECURITY: academic_period_id is NOT in rules(). It is resolved server-side
in the controller from AcademicPeriod::requireActive()->id.
```

#### [NEW] `app/Http/Requests/UpdateAssignmentRequest.php`

```
authorize():
  Resolves $assignment = Assignment::findOrFail($this->route('assignment'))
  Returns $this->user()->can('update', $assignment)

rules():
  title        → required | string | max:255
  description  → nullable | string
  due_date     → nullable | date | after:now

SECURITY: subject_id, kelas, ustadz_id, academic_period_id are NOT
updatable. These are the ownership anchors and must not change after creation.
```

---

### A5. Controller — Ustadz

#### [NEW] `app/Http/Controllers/Ustadz/AssignmentController.php`

| Method | HTTP | Description | Authorization |
|---|---|---|---|
| `index` | GET | List Ustadz's own assignments for active period, paginated | `viewAny` |
| `create` | GET | Show create form; load Ustadz's subjects/kelas from Jadwal | `create` |
| `store` | POST | Persist new assignment; resolve period server-side | `StoreAssignmentRequest` |
| `edit` | GET | Show edit form for a draft assignment | `update` |
| `update` | PUT | Update title/description/due_date | `UpdateAssignmentRequest` |
| `destroy` | DELETE | Delete draft assignment | `delete` |
| `open` | PATCH | Transition draft → open | `open` |
| `close` | PATCH | Transition open → closed | `close` |

**Controller implementation notes:**

```php
// index: always filter by active period
$activePeriod = AcademicPeriod::requireActive();
$assignments = Assignment::with(['subject'])
    ->where('ustadz_id', Auth::id())
    ->where('academic_period_id', $activePeriod->id)
    ->orderByDesc('created_at')
    ->paginate(15);

// store: period resolved server-side — never from form input
$assignment = Assignment::create([
    ...$request->validated(),
    'ustadz_id'          => Auth::id(),
    'academic_period_id' => AcademicPeriod::requireActive()->id,
    'status'             => 'draft',
]);

// open: status transition only — no other fields changed
Gate::authorize('open', $assignment);
$assignment->update(['status' => 'open']);

// close: status transition only
Gate::authorize('close', $assignment);
$assignment->update(['status' => 'closed']);
```

---

### A6. Routes

#### [MODIFY] `routes/web.php`

Add to the `role:ustadz` prefix group:

```php
// LMS Assignments (Ustadz)
Route::get('/assignments', [AssignmentController::class, 'index'])
    ->name('assignments.index');
Route::get('/assignments/create', [AssignmentController::class, 'create'])
    ->name('assignments.create');
Route::post('/assignments', [AssignmentController::class, 'store'])
    ->name('assignments.store');
Route::get('/assignments/{assignment}/edit', [AssignmentController::class, 'edit'])
    ->name('assignments.edit');
Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])
    ->name('assignments.update');
Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])
    ->name('assignments.destroy');
Route::patch('/assignments/{assignment}/open', [AssignmentController::class, 'open'])
    ->name('assignments.open');
Route::patch('/assignments/{assignment}/close', [AssignmentController::class, 'close'])
    ->name('assignments.close');
```

**Route names:** `ustadz.assignments.index`, `ustadz.assignments.create`, `ustadz.assignments.store`, `ustadz.assignments.edit`, `ustadz.assignments.update`, `ustadz.assignments.destroy`, `ustadz.assignments.open`, `ustadz.assignments.close`.

---

### A7. Frontend Pages (Stub Only — P1-3A)

> [!NOTE]
> Full UI is deferred to P1-3C. P1-3A creates controller stubs that return an Inertia response with a minimal scaffold. This ensures routes are testable without blocking on UI design.

| File | Description |
|---|---|
| [NEW] `resources/js/Pages/Ustadz/Assignment/Index.jsx` | Minimal stub — renders assignment list from props |
| [NEW] `resources/js/Pages/Ustadz/Assignment/Create.jsx` | Minimal stub — form with subject, kelas, title, due_date |
| [NEW] `resources/js/Pages/Ustadz/Assignment/Edit.jsx` | Minimal stub — edit form for title, description, due_date |

Full design implementation (styled components, SweetAlert confirmations) is P1-3C.

---

### A8. Tests

#### [NEW] `tests/Feature/Ustadz/AssignmentTest.php`

**Role boundary tests:**

| Test | Assertion |
|---|---|
| Admin can access `ustadz.assignments.index` via admin bypass | HTTP 200 (via before() → true) |
| Santri cannot access `ustadz.assignments.index` | HTTP 403 |
| Unauthenticated user cannot access any assignment route | HTTP 302 → login |

**Ustadz ownership boundary tests:**

| Test | Assertion |
|---|---|
| Ustadz creates assignment for a class they teach (Jadwal exists) | HTTP 302 (redirect) + assignment in DB |
| Ustadz creates assignment for a class they do NOT teach | HTTP 403 |
| Ustadz A edits Ustadz B's assignment | HTTP 403 |
| Ustadz A deletes Ustadz B's assignment | HTTP 403 |
| Ustadz opens Ustadz B's assignment | HTTP 403 |

**Temporal boundary tests:**

| Test | Assertion |
|---|---|
| Ustadz cannot edit own assignment from a past (inactive) period | HTTP 403 |
| Ustadz cannot delete own assignment from a past period | HTTP 403 |
| Ustadz cannot open own assignment from a past period | HTTP 403 |
| Form submit with tampered `academic_period_id` in body | Server ignores it; uses `requireActive()` |

**Period injection prevention:**

| Test | Assertion |
|---|---|
| POST `/ustadz/assignments` with `academic_period_id` in body (past period ID) | Assignment is saved with active period ID, not the injected one |

**Status lifecycle tests:**

| Test | Assertion |
|---|---|
| Ustadz can open a draft assignment | Status becomes `open` |
| Ustadz cannot open an already open assignment | HTTP 403 |
| Ustadz can close an open assignment | Status becomes `closed` |
| Ustadz cannot close a draft assignment | HTTP 403 |
| Ustadz cannot delete an open assignment | HTTP 403 |
| Ustadz cannot delete a closed assignment | HTTP 403 |
| Ustadz cannot edit an open assignment | HTTP 403 |

**Santri visibility tests (policy coverage without UI):**

| Test | Assertion |
|---|---|
| `AssignmentPolicy::view` returns true for Santri with matching `kelas` and `open` assignment | True |
| `AssignmentPolicy::view` returns false for Santri with wrong `kelas` | False |
| `AssignmentPolicy::view` returns false for `draft` assignment | False |
| `AssignmentPolicy::view` returns false for `closed` assignment | False |
| `AssignmentPolicy::view` returns false for assignment in inactive period | False |

**Regression guard:**

All 90 existing tests must remain green after P1-3A merges.

---

### A9. P1-3A Completion Criteria

- [ ] `create_assignments_table` migration created and runs clean.
- [ ] `Assignment` model created with correct fillable, casts, relationships.
- [ ] `AssignmentPolicy` created and all 8 methods implemented.
- [ ] `StoreAssignmentRequest` and `UpdateAssignmentRequest` created.
- [ ] `Ustadz/AssignmentController` created with all 8 action methods.
- [ ] Routes registered; `php artisan route:list | grep assignments` shows all 8 routes.
- [ ] Stub Inertia page components created (Index, Create, Edit).
- [ ] `AssignmentTest.php` created; all new tests pass.
- [ ] All 90+ existing tests remain green.
- [ ] `vendor/bin/pint --dirty` runs clean.

---

## Milestone P1-3B: Submission Foundation

**Prerequisite:** P1-3A merged with all tests green. **[GATE]**

**Goal:** Establish the `submissions` table, `Submission` model, `SubmissionPolicy`, form requests, and Santri/Ustadz submission controllers. No frontend pages in this milestone.

**PR size estimate:** 1 PR.

---

### B1. Database Changes

#### [NEW] `database/migrations/create_submissions_table.php`

```
Schema::create('submissions', function (Blueprint $table) {
    $table->id();

    // Ownership
    $table->foreignId('assignment_id')
          ->constrained()->onDelete('cascade');   // cascade: if assignment deleted, remove submissions
    $table->foreignId('santri_id')
          ->constrained()->onDelete('restrict');   // restrict: santri record must remain

    // Submission data (MVP: text-only; file_path added via additive migration when O9 resolved)
    $table->text('content')->nullable();          // typed answer field

    // Temporal tracking — lateness is derived, not stored
    $table->dateTime('submitted_at')->nullable(); // NULL = draft; set on submit action

    // Lifecycle: 'draft' | 'submitted' | 'graded'
    $table->string('status', 20)->default('draft');

    // Reserved for P1-5 grading — null until graded
    $table->decimal('score', 5, 2)->nullable();

    $table->timestamps();

    // Constraints
    $table->unique(['assignment_id', 'santri_id']); // one submission per Santri per assignment

    // Indexes
    $table->index('santri_id');
    $table->index(['assignment_id', 'status']);
});
```

**Migration dependency:** `assignments` table must exist (P1-3A).

**`ON DELETE CASCADE` rationale:** If an Admin deletes an assignment, all associated submissions are removed. A submission without its parent assignment is semantically invalid.

**`ON DELETE RESTRICT` on `santri_id` rationale:** Prevent orphaning; a Santri record must be deactivated, not deleted while submissions exist.

**Post-migration command:** `php artisan migrate:fresh --seed`

**Seeder addition:** No submissions seeded by default (Santri must submit via the UI workflow).

---

### B2. Model

#### [NEW] `app/Models/Submission.php`

```php
// Key implementation notes:
// - $fillable: assignment_id, santri_id, content, submitted_at, status, score
// - $casts: submitted_at => 'datetime', score => 'decimal:2'
// - Relationships:
//     assignment() → belongsTo(Assignment::class)
//     santri()     → belongsTo(Santri::class)
// - Accessor: isLate() — computed, NOT stored:
//     public function isLate(): bool
//     {
//         return $this->submitted_at !== null
//             && $this->assignment->due_date !== null
//             && $this->submitted_at->gt($this->assignment->due_date);
//     }
//
// IMPORTANT: Do NOT add a 'late' column. Lateness is derived from
// submitted_at > assignment.due_date at query/accessor time.
```

#### [MODIFY] `app/Models/Assignment.php`

Add the `submissions()` hasMany relationship:

```php
public function submissions(): HasMany
{
    return $this->hasMany(Submission::class);
}
```

---

### B3. Authorization — SubmissionPolicy

#### [NEW] `app/Policies/SubmissionPolicy.php`

```
Command: php artisan make:policy SubmissionPolicy --model=Submission
```

**Policy implementation:**

```
before(User $user, string $ability): ?bool
  Admin → return true
  Others → return null

view(User $user, Submission $submission): bool
  Santri → $user->santri && $user->santri->id === $submission->santri_id
  Ustadz → $submission->assignment->ustadz_id === $user->id
  Others → false

create(User $user): bool
  Santri → true
  // IMPORTANT: Teaching-scope / assignment validity validated in
  // StoreSubmissionRequest::authorize(), not here.
  Others → false

update(User $user, Submission $submission): bool
  Santri → $user->santri
            && $user->santri->id === $submission->santri_id
            && $submission->status === 'draft'
            && $submission->assignment->status === 'open'
            // O6 default: submitted submissions are immutable.
  Others → false

grade(User $user, Submission $submission): bool
  // Reserved for P1-5. Defined now to anchor the grading path.
  Ustadz → $submission->assignment->ustadz_id === $user->id
  Others → false
```

---

### B4. Form Requests

#### [NEW] `app/Http/Requests/StoreSubmissionRequest.php`

```
authorize():
  Santri-only check (role boundary).
  Resolve $assignment = Assignment::findOrFail($this->input('assignment_id')).

  Injection prevention chain (all must be true):
  1. Assignment exists: already guaranteed by findOrFail.
  2. Assignment is 'open': $assignment->status === 'open'
  3. Assignment belongs to active period:
       $assignment->academic_period_id === AcademicPeriod::requireActive()->id
  4. Santri's kelas matches assignment's kelas:
       $this->user()->santri->kelas === $assignment->kelas
  5. Santri record exists on authenticated user:
       $this->user()->santri !== null

  If any check fails → return false (403).

rules():
  assignment_id → required | exists:assignments,id
  content       → nullable | string | max:10000

SECURITY:
- santri_id is NOT in rules(). It is resolved server-side from
  $request->user()->santri->id in the controller.
- academic_period_id is NOT in rules(). Derived from the assignment record.
- A Santri cannot submit to a draft, closed, or foreign-kelas assignment.
```

#### [NEW] `app/Http/Requests/UpdateSubmissionRequest.php`

```
authorize():
  Resolves $submission = Submission::findOrFail($this->route('submission'))
  Returns $this->user()->can('update', $submission)

rules():
  content → nullable | string | max:10000
  status  → nullable | string | in:draft,submitted

SECURITY:
- assignment_id and santri_id are NOT updatable.
- score is NOT updatable by Santri (only Ustadz in P1-5 grading path).
```

---

### B5. Controllers

#### [NEW] `app/Http/Controllers/Santri/AssignmentController.php`

| Method | HTTP | Description | Authorization |
|---|---|---|---|
| `index` | GET | List `open` assignments for Santri's `kelas` in the active period | `viewAny` |
| `show` | GET | View a single assignment | `view` |

```php
// index: filter strictly to Santri's kelas and active period
$activePeriod = AcademicPeriod::requireActive();
$santri = $request->user()->santri;

$assignments = Assignment::with(['subject'])
    ->where('kelas', $santri->kelas)
    ->where('academic_period_id', $activePeriod->id)
    ->where('status', 'open')
    ->orderBy('due_date')
    ->paginate(15);

// IMPORTANT: No user-supplied filter on kelas or period accepted.
// Santri cannot supply their own kelas to bypass the authenticated value.
```

#### [NEW] `app/Http/Controllers/Santri/SubmissionController.php`

| Method | HTTP | Description | Authorization |
|---|---|---|---|
| `store` | POST | Create or update a submission (upsert via `updateOrCreate` on unique key) | `StoreSubmissionRequest` |
| `update` | PUT | Update content or finalize (change status to `submitted`) | `UpdateSubmissionRequest` |

```php
// store: santri_id resolved server-side — never from form input
// submitted_at set when status transitions to 'submitted', null for draft saves
$santri = $request->user()->santri;

$submission = Submission::updateOrCreate(
    [
        'assignment_id' => $request->validated('assignment_id'),
        'santri_id'     => $santri->id,    // server-side — not from request body
    ],
    [
        'content'      => $request->validated('content'),
        'status'       => $request->validated('status', 'draft'),
        'submitted_at' => $request->validated('status') === 'submitted' ? now() : null,
    ]
);
```

#### [NEW] `app/Http/Controllers/Ustadz/SubmissionController.php`

| Method | HTTP | Description | Authorization |
|---|---|---|---|
| `index` | GET | List submissions for a given assignment (Ustadz's own only) | `viewAny` on Assignment |
| `show` | GET | View a single submission | `view` |

```php
// index: guard that the assignment belongs to the authenticated Ustadz
Gate::authorize('view', $assignment);

$submissions = Submission::with(['santri'])
    ->where('assignment_id', $assignment->id)
    ->orderByDesc('submitted_at')
    ->paginate(20);
```

---

### B6. Routes

#### [MODIFY] `routes/web.php`

Add to the `role:ustadz` prefix group:

```php
// Submission review (Ustadz)
Route::get('/assignments/{assignment}/submissions', [UstadzSubmissionController::class, 'index'])
    ->name('assignments.submissions.index');
Route::get('/assignments/{assignment}/submissions/{submission}', [UstadzSubmissionController::class, 'show'])
    ->name('assignments.submissions.show');
```

Add to the `role:santri` prefix group:

```php
// Assignment browsing (Santri)
Route::get('/assignments', [SantriAssignmentController::class, 'index'])
    ->name('assignments.index');
Route::get('/assignments/{assignment}', [SantriAssignmentController::class, 'show'])
    ->name('assignments.show');

// Submission (Santri)
Route::post('/submissions', [SantriSubmissionController::class, 'store'])
    ->name('submissions.store');
Route::put('/submissions/{submission}', [SantriSubmissionController::class, 'update'])
    ->name('submissions.update');
```

**Route names:**
- `ustadz.assignments.submissions.index`, `ustadz.assignments.submissions.show`
- `santri.assignments.index`, `santri.assignments.show`
- `santri.submissions.store`, `santri.submissions.update`

---

### B7. Frontend Pages (Stub Only — P1-3B)

> [!NOTE]
> Full UI is deferred to P1-3C. Minimal stubs ensure routes are testable.

| File | Description |
|---|---|
| [NEW] `resources/js/Pages/Ustadz/Assignment/Submissions.jsx` | Stub — submission list for an assignment |
| [NEW] `resources/js/Pages/Santri/Assignment/Index.jsx` | Stub — open assignment list |
| [NEW] `resources/js/Pages/Santri/Assignment/Show.jsx` | Stub — single assignment view with submission form |

---

### B8. Tests

#### [NEW] `tests/Feature/Santri/SubmissionTest.php`

**Role boundary tests:**

| Test | Assertion |
|---|---|
| Ustadz cannot submit to `santri.submissions.store` | HTTP 403 |
| Admin cannot submit to `santri.submissions.store` | HTTP 403 (role:santri route guard) |
| Unauthenticated user cannot access Santri assignment routes | HTTP 302 → login |

**Santri injection prevention tests:**

| Test | Assertion |
|---|---|
| Santri submits `santri_id` of another Santri in request body | Submission saved with authenticated Santri's ID; injected value ignored |
| Santri submits to a `draft` assignment | HTTP 403 |
| Santri submits to a `closed` assignment | HTTP 403 |
| Santri submits with `assignment_id` from a different `kelas` | HTTP 403 |
| Santri submits with `assignment_id` from a past (inactive) period | HTTP 403 |
| Santri A views Santri B's submission directly | HTTP 403 |

**Submission lifecycle tests:**

| Test | Assertion |
|---|---|
| Santri creates a draft submission | HTTP 302; submission in DB with `status = draft`, `submitted_at = null` |
| Santri finalizes submission (status → submitted) | HTTP 302; `submitted_at` is set |
| Santri attempts to update their own `submitted` submission | HTTP 403 (immutable after submit) |
| Santri attempts to update submission when assignment is `closed` | HTTP 403 |
| Santri cannot set `score` on their own submission | Score remains null; field ignored |
| Duplicate submit (same Santri, same assignment) uses `updateOrCreate` | Only one row in DB; no duplicate key error |

**Lateness derivation test:**

| Test | Assertion |
|---|---|
| Submission `submitted_at` after `assignment.due_date` → `isLate()` returns true | True |
| Submission `submitted_at` before `assignment.due_date` → `isLate()` returns false | False |
| Assignment has no `due_date` → `isLate()` always returns false | False |

#### [NEW] `tests/Feature/Ustadz/AssignmentSubmissionTest.php`

| Test | Assertion |
|---|---|
| Ustadz views submissions for their own assignment | HTTP 200 |
| Ustadz A views submissions for Ustadz B's assignment | HTTP 403 |
| Ustadz cannot call `santri.submissions.store` | HTTP 403 (role guard) |

---

### B9. P1-3B Completion Criteria

- [ ] `create_submissions_table` migration created and runs clean.
- [ ] `Submission` model created with correct fillable, casts, relationships, and `isLate()` accessor.
- [ ] `Assignment` model updated with `submissions()` relationship.
- [ ] `SubmissionPolicy` created with all 5 methods implemented.
- [ ] `StoreSubmissionRequest` and `UpdateSubmissionRequest` created with injection-prevention chain.
- [ ] `Santri/AssignmentController` created (index, show).
- [ ] `Santri/SubmissionController` created (store, update).
- [ ] `Ustadz/SubmissionController` created (index, show).
- [ ] All routes registered; `php artisan route:list | grep submission` shows all routes.
- [ ] Stub Inertia page components created.
- [ ] All new tests in `SubmissionTest.php` and `AssignmentSubmissionTest.php` pass.
- [ ] All 90+ existing tests remain green.
- [ ] `vendor/bin/pint --dirty` runs clean.

---

## Milestone P1-3C: LMS UI Foundation

**Prerequisite:** P1-3B merged with all tests green. **[GATE]**

**Goal:** Implement full Inertia/React UI for Ustadz assignment management and Santri submission experience. Replace stubs created in P1-3A and P1-3B with production-quality pages following the existing Tailwind CSS design language.

**PR size estimate:** 1–2 PRs (may split Ustadz UI and Santri UI if scope warrants).

> [!NOTE]
> O8 — Admin assignment UI: No Admin LMS UI in P1-3. Admin retains full functional access via policy `before()`.

---

### C1. Ustadz Assignment UI

#### [MODIFY] `resources/js/Pages/Ustadz/Assignment/Index.jsx`

Full implementation:
- Paginated table of Ustadz's assignments for the active period.
- Columns: Title, Subject, Class (`kelas`), Due Date, Status badge (draft/open/closed), Actions.
- Status badge: visual distinction per status (e.g., gray=draft, green=open, red=closed).
- Actions per assignment:
  - `draft`: Edit | Open | Delete
  - `open`: View Submissions | Close
  - `closed`: View Submissions
- SweetAlert confirmation on **Delete** and **Open** (irreversible visibility change).
- Search/filter by subject or status.
- Empty state when no assignments exist.

#### [MODIFY] `resources/js/Pages/Ustadz/Assignment/Create.jsx`

Full implementation:
- Form: Subject (dropdown — only subjects Ustadz teaches in active period), Class (`kelas` — only classes Ustadz teaches for that subject), Title, Description (textarea), Due Date (optional date-time picker).
- Inline validation errors for all fields.
- Subject/Kelas dropdowns are dynamically linked (selecting a subject filters kelas options).
- Cancel → back to `ustadz.assignments.index`.
- On success: redirect to index with SweetAlert success toast.

#### [MODIFY] `resources/js/Pages/Ustadz/Assignment/Edit.jsx`

Full implementation:
- Editable fields: Title, Description, Due Date only.
- Subject, Kelas, and Period are displayed as read-only (they are the ownership anchors and cannot be changed).
- On success: redirect to index with SweetAlert success toast.

#### [MODIFY] `resources/js/Pages/Ustadz/Assignment/Submissions.jsx`

Full implementation:
- Assignment details header (title, kelas, subject, due date, status).
- Table of submitted work: Santri name, NIS, submitted_at, lateness indicator (`is_late` accessor), status badge, link to show.
- Pagination.
- Summary: total submissions / total eligible Santri in kelas.
- Note: grade input (score) is deferred to P1-5. This view is read-only for submissions.

---

### C2. Santri Assignment UI

#### [MODIFY] `resources/js/Pages/Santri/Assignment/Index.jsx`

Full implementation:
- List of `open` assignments for Santri's `kelas` in the active period.
- Columns: Title, Subject, Due Date, Countdown indicator (days remaining), Submission status (not started / draft / submitted).
- Sorted by due date ascending (most urgent first).
- Submission status badge per assignment (derived from whether a Submission row exists for this Santri + assignment).
- Empty state when no open assignments.

#### [MODIFY] `resources/js/Pages/Santri/Assignment/Show.jsx`

Full implementation:
- Assignment details: title, subject, kelas, description, due date.
- Lateness warning banner if `now() > due_date` (if O6 allows late submission; otherwise a locked state message).
- Submission form (below assignment details):
  - `content` textarea — required if submitting, optional if saving as draft.
  - Two action buttons: **Save Draft** (status=draft) | **Submit** (status=submitted).
  - SweetAlert confirmation before **Submit** (irreversible finalization per O6 policy).
  - If submission exists: form pre-populated with existing content and current status.
  - If assignment is `closed` or submission is `submitted` or `graded`: form is read-only; show locked state.

---

### C3. Santri Navigation Integration

#### [MODIFY] Santri layout/navigation component

Add "Tugas" (Assignments) link to Santri sidebar/nav, pointing to `santri.assignments.index`.

Follow the same nav pattern as "Jadwal" and "Materi" links in the existing Santri layout.

---

### C4. Ustadz Navigation Integration

#### [MODIFY] Ustadz layout/navigation component

Add "Tugas" (Assignments) link to Ustadz sidebar/nav, pointing to `ustadz.assignments.index`.

Follow the same nav pattern as "Penilaian" and "Materi" in the existing Ustadz layout.

---

### C5. Tests

#### [NEW] `tests/Feature/Santri/SantriAssignmentPortalTest.php`

Full portal integration tests:

| Test | Assertion |
|---|---|
| Santri can access `santri.assignments.index` | HTTP 200; only `open` assignments for own `kelas` returned |
| Santri cannot see assignments for a different `kelas` | HTTP 200; those assignments absent from response |
| Santri can access `santri.assignments.show` for an `open` assignment in their kelas | HTTP 200 |
| Santri cannot access `santri.assignments.show` for a `draft` assignment | HTTP 403 |
| Santri cannot access `santri.assignments.show` for a `closed` assignment | HTTP 403 |
| Santri cannot access assignments in an inactive period | HTTP 200; empty list (period filter) |
| Santri submits and can see their submission pre-populated on revisit | HTTP 200; content present in props |

#### [MODIFY] `tests/Feature/Ustadz/AssignmentTest.php`

Add UI-layer tests:

| Test | Assertion |
|---|---|
| Ustadz `index` returns paginated assignments with correct props | Props contain `assignments.data`, `assignments.links` |
| Ustadz `create` returns correct Inertia props (subjects, kelas options) | Props contain only subjects Ustadz teaches in active period |
| Ustadz `store` with valid data creates assignment and redirects | HTTP 302; assignment in DB with `status = draft` |
| Ustadz `store` with invalid kelas (not in config) fails validation | HTTP 422; validation error on `kelas` |

---

### C6. P1-3C Completion Criteria

- [ ] `Ustadz/Assignment/Index.jsx` — full implementation with status badges, actions, SweetAlert confirmations.
- [ ] `Ustadz/Assignment/Create.jsx` — full form with linked subject/kelas dropdowns.
- [ ] `Ustadz/Assignment/Edit.jsx` — full form; ownership anchors are read-only.
- [ ] `Ustadz/Assignment/Submissions.jsx` — read-only submission review table.
- [ ] `Santri/Assignment/Index.jsx` — open assignment list with submission status indicators.
- [ ] `Santri/Assignment/Show.jsx` — assignment detail + submission form with draft/submit actions.
- [ ] Santri nav updated with "Tugas" link.
- [ ] Ustadz nav updated with "Tugas" link.
- [ ] All new UI feature tests pass.
- [ ] All 90+ existing tests remain green.
- [ ] `npm run build` completes without errors.
- [ ] `vendor/bin/pint --dirty` runs clean.

---

## Cross-Cutting Security Verification

The following security properties must be explicitly verified across all three milestones by automated tests. They are not optional.

### Academic Period Tampering Prevention

| Scenario | Prevention Mechanism |
|---|---|
| Ustadz injects past `academic_period_id` in assignment create POST body | `StoreAssignmentRequest::rules()` excludes `academic_period_id`; controller uses `requireActive()` |
| Santri injects a period ID in submission POST body | `StoreSubmissionRequest::rules()` excludes it; period derived from assignment |
| Ustadz attempts to edit assignment in an inactive period | `AssignmentPolicy::update()` checks `requireActive()` |

### `assignment_id` Manipulation Prevention

| Scenario | Prevention Mechanism |
|---|---|
| Santri submits with `assignment_id` for another kelas | `StoreSubmissionRequest::authorize()` validates `assignment->kelas === santri->kelas` |
| Santri submits with `assignment_id` for inactive period | `StoreSubmissionRequest::authorize()` validates `assignment->academic_period_id === requireActive()->id` |
| Santri submits to a draft/closed assignment | `StoreSubmissionRequest::authorize()` validates `assignment->status === 'open'` |

### `santri_id` Spoofing Prevention

| Scenario | Prevention Mechanism |
|---|---|
| Santri includes a different Santri's ID in POST body | `Santri/SubmissionController::store()` resolves `santri_id` from `$request->user()->santri->id`; form field ignored |
| Santri A views Santri B's submission via direct URL | `SubmissionPolicy::view()` checks `$user->santri->id === $submission->santri_id` |

### Ustadz Ownership Validation

| Scenario | Prevention Mechanism |
|---|---|
| Ustadz A edits Ustadz B's assignment | `AssignmentPolicy::update()` checks `$user->id === $assignment->ustadz_id` |
| Ustadz A opens/closes Ustadz B's assignment | `AssignmentPolicy::open()` / `close()` check ownership |
| Ustadz A views Ustadz B's submission review | `AssignmentPolicy::view()` / `SubmissionPolicy::view()` check `ustadz_id` |

### Santri Class Visibility

| Scenario | Prevention Mechanism |
|---|---|
| Santri queries assignments directly via URL for another kelas | `AssignmentPolicy::view()` validates `santri->kelas === assignment->kelas` |
### Final Security Constraints Summary

1. `academic_period_id` is always server resolved (never accepted from request payload).
2. `santri_id` is never accepted from request payload (always resolved from `$request->user()->santri->id`).
3. Assignment ownership is validated by policy (`AssignmentPolicy` restricts Ustadz to their own assignments).
4. Class visibility is enforced server-side (Santri can only view and submit to assignments matching their `kelas`).

---

## Scope Boundary Enforcement

The following must NOT be introduced in any P1-3A/B/C PR. If discovered in review, the PR must be revised before merge.

| Prohibited | Reason |
|---|---|
| Grade publishing workflow or `penilaians.is_published` | Explicitly deferred to P1-6. |
| Penilaian synchronization (any write from `submissions.score` to `penilaians`) | Explicitly deferred to P1-5. |
| Attendance, messaging, notifications | Out of LMS scope entirely |
| File upload infrastructure (`file_path` column, storage handling) | Deferred pending O9; text-only MVP |
| Repository/service layer classes | Direct Eloquent in controllers per project principles |
| `late` as a stored submission status column | Rejected; lateness is derived from `submitted_at > due_date` |
| Admin assignment management UI routes | Deferred per O8 default |
| Question bank / MCQ / Essay columns | Separate, subsequent design task |

---

## Consistency Verification

**Verified against all P1 architecture decisions:**

| Decision Document | Relevant Decision | Consistent? |
|---|---|---|
| `p1_domain_decision_record.md` Decision 1 | `academic_period_id NOT NULL` on all academic tables | ✅ `assignments.academic_period_id NOT NULL` |
| `p1_domain_decision_record.md` Decision 2 | `kelas` as config-constrained string | ✅ Validated via `Rule::in(config('pesantren.kelas_allowed'))` |
| `p1_domain_decision_record.md` Decision 3 | Jadwal as implicit teaching scope | ✅ `StoreAssignmentRequest::authorize()` queries Jadwal |
| `p1_academic_period_architecture.md §3` | Ustadz CRUD limited to active period | ✅ All policy methods check `requireActive()` |
| `p1_academic_period_architecture.md §4` | `academic_period_id` never in form input | ✅ Excluded from all form request `rules()` |
| `p1_2_santri_portal_architecture.md §2` | Santri cannot access other Santri data | ✅ `SubmissionPolicy::view()` and `santri_id` server-side resolution |
| `p1_lms_architecture.md §2.3` | Status: `draft | open | closed` | ✅ No `published` anywhere in plan |
| `p1_lms_architecture.md §2.5` | Status: `draft | submitted | graded`; no `late` | ✅ `late` excluded; `isLate()` is an accessor |
| `p1_lms_architecture.md §2.7` | `is_published` not implemented | ✅ Not referenced anywhere in plan |
| `p1_lms_architecture.md §6.4` | No write path from submissions to penilaians | ✅ Not introduced in any milestone |
| `docs/DESIGN.md §5.1` | No service/repository layers | ✅ Direct Eloquent in all controllers |
| `docs/AGENTS.md` | Tests are part of definition of done | ✅ Each milestone includes required tests |
| `docs/AGENTS.md` | SweetAlert for destructive actions | ✅ Delete and Open confirmed via SweetAlert in P1-3C |

---

## Implementation Order Summary

```
P1-3A: Assignment Foundation
  ├── create_assignments_table migration
  ├── Assignment model
  ├── AssignmentPolicy (8 methods)
  ├── StoreAssignmentRequest + UpdateAssignmentRequest
  ├── Ustadz/AssignmentController (8 actions)
  ├── 8 Ustadz assignment routes
  ├── Stub React pages (Index, Create, Edit)
  └── AssignmentTest.php

        [GATE: P1-3A merged, all tests green]

P1-3B: Submission Foundation
  ├── create_submissions_table migration
  ├── Submission model (+ isLate accessor)
  ├── Assignment model → submissions() relationship
  ├── SubmissionPolicy (5 methods)
  ├── StoreSubmissionRequest + UpdateSubmissionRequest
  ├── Santri/AssignmentController (index, show)
  ├── Santri/SubmissionController (store, update)
  ├── Ustadz/SubmissionController (index, show)
  ├── 6 new routes (Ustadz submission review, Santri assignment + submission)
  ├── Stub React pages (Submissions, Santri/Index, Santri/Show)
  └── SubmissionTest.php + AssignmentSubmissionTest.php

        [GATE: P1-3B merged, all tests green]

P1-3C: LMS UI Foundation
  ├── Full Ustadz assignment pages (Index, Create, Edit, Submissions)
  ├── Full Santri assignment pages (Index, Show + submission form)
  ├── Santri navigation update
  ├── Ustadz navigation update
  └── SantriAssignmentPortalTest.php + UI integration tests
```

---

## File Index

### New Files (P1-3A)
- `database/migrations/create_assignments_table.php`
- `app/Models/Assignment.php`
- `app/Policies/AssignmentPolicy.php`
- `app/Http/Requests/StoreAssignmentRequest.php`
- `app/Http/Requests/UpdateAssignmentRequest.php`
- `app/Http/Controllers/Ustadz/AssignmentController.php`
- `resources/js/Pages/Ustadz/Assignment/Index.jsx` (stub → full in P1-3C)
- `resources/js/Pages/Ustadz/Assignment/Create.jsx` (stub → full in P1-3C)
- `resources/js/Pages/Ustadz/Assignment/Edit.jsx` (stub → full in P1-3C)
- `tests/Feature/Ustadz/AssignmentTest.php`

### Modified Files (P1-3A)
- `routes/web.php` — 8 Ustadz assignment routes added
- `database/seeders/DatabaseSeeder.php` — assignment seed entries

### New Files (P1-3B)
- `database/migrations/create_submissions_table.php`
- `app/Models/Submission.php`
- `app/Policies/SubmissionPolicy.php`
- `app/Http/Requests/StoreSubmissionRequest.php`
- `app/Http/Requests/UpdateSubmissionRequest.php`
- `app/Http/Controllers/Santri/AssignmentController.php`
- `app/Http/Controllers/Santri/SubmissionController.php`
- `app/Http/Controllers/Ustadz/SubmissionController.php`
- `resources/js/Pages/Ustadz/Assignment/Submissions.jsx` (stub → full in P1-3C)
- `resources/js/Pages/Santri/Assignment/Index.jsx` (stub → full in P1-3C)
- `resources/js/Pages/Santri/Assignment/Show.jsx` (stub → full in P1-3C)
- `tests/Feature/Santri/SubmissionTest.php`
- `tests/Feature/Ustadz/AssignmentSubmissionTest.php`

### Modified Files (P1-3B)
- `app/Models/Assignment.php` — `submissions()` relationship added
- `routes/web.php` — 6 Santri/Ustadz submission routes added

### Modified Files (P1-3C)
- `resources/js/Pages/Ustadz/Assignment/Index.jsx` (full)
- `resources/js/Pages/Ustadz/Assignment/Create.jsx` (full)
- `resources/js/Pages/Ustadz/Assignment/Edit.jsx` (full)
- `resources/js/Pages/Ustadz/Assignment/Submissions.jsx` (full)
- `resources/js/Pages/Santri/Assignment/Index.jsx` (full)
- `resources/js/Pages/Santri/Assignment/Show.jsx` (full)
- Ustadz layout/nav component — "Tugas" link
- Santri layout/nav component — "Tugas" link

### New Files (P1-3C)
- `tests/Feature/Santri/SantriAssignmentPortalTest.php`

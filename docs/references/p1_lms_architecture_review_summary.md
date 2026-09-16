# P1-3 LMS Architecture Review Summary

**Date:** 2026-09-15
**Branch:** `feature/p1-lms-architecture-review`
**Status:** PENDING APPROVAL — Do not implement until this summary is signed off.
**Full document:** `docs/references/p1_lms_architecture.md`

---

## What Was Reviewed

1. All P1 reference decisions (`p1_domain_decision_record.md`, `p1_implementation_roadmap.md`, `p1_academic_period_architecture.md`, `p1_2_santri_portal_architecture.md`, `p1_final_stabilization_audit.md`)
2. All domain models: `User`, `Santri`, `Ustadz`, `AcademicPeriod`, `Subject`, `Jadwal`, `Materi`, `Penilaian`
3. All existing policies: `MateriPolicy`, `PenilaianPolicy`, `SantriPolicy`, `JadwalPolicy`, `AcademicPeriodPolicy`
4. All controllers: Admin (6), Ustadz (5), Santri (3)

---

## Foundation State Assessment

**The system is structurally ready for P1-3 LMS implementation.**

All prerequisite gates are satisfied:

| Gate | Status |
|---|---|
| `academic_periods` table + `AcademicPeriod::requireActive()` | COMPLETE |
| `jadwals.academic_period_id NOT NULL` + composite unique | COMPLETE |
| `penilaians.academic_period_id NOT NULL` + updated unique key | COMPLETE |
| `materis.academic_period_id NOT NULL` | COMPLETE |
| `penilaians.is_published` + Ustadz grade release | COMPLETE |
| Santri authenticated portal (schedule, materi, grades) | COMPLETE |
| Authorization hole in `StorePenilaianRequest` (temporal) | PATCHED (P1 stabilization) |
| Ustadz `SantriController` missing `Gate::authorize()` | PATCHED (P1 stabilization) |
| Test suite baseline | 71+ tests, 100% passing |

---

## Key Architectural Decisions Made

### 1. Assignment Ownership: Option C — Composite Teaching Scope

**Decision:** `assignments` carries `ustadz_id + subject_id + kelas + academic_period_id` as a unit.

This mirrors the teaching-scope pattern already established in `MateriPolicy`, `PenilaianPolicy`, and `StorePenilaianRequest`. No new authorization concept is introduced. The Santri audience is structurally deterministic from `kelas`. Option A (Ustadz-only) and Option B (Subject-only) were rejected for lacking structural audience derivation and violating horizontal privilege boundaries respectively.

### 2. Assignment Period Binding: `academic_period_id NOT NULL`

**Decision:** All assignments must belong to an academic period. Period is resolved server-side from `AcademicPeriod::requireActive()` — never exposed in form input.

Nullable was rejected. Assignments are inherently time-bound, unlike materials where a perennial reuse case was considered.

### 3. Submission Ownership: One per Santri, Status-Based Lifecycle

**Decision:** `UNIQUE(assignment_id, santri_id)`. Status lifecycle: `draft → submitted → late → graded`.

Resubmission before deadline via `updateOrCreate`. Post-deadline resubmission policy is **[OPEN O6]** — requires stakeholder decision.

### 4. Penilaian Relationship: Separate, No Coupling in P1-3

**Decision:** `submissions.score` (nullable) is reserved for P1-5 grading. No write path from `submissions` to `penilaians` in P1-3.

Rationale: grading formula (O5) is unresolved, `penilaians` is a live production workflow, and the PRD explicitly separates "Grade Recording" (§3.5) from "Assessment Creation" (§3.6).

---

## Proposed Schema (Design Only — No Migrations Created)

### `assignments`
```
id, academic_period_id (NOT NULL, FK RESTRICT), subject_id (FK RESTRICT),
ustadz_id (FK RESTRICT), kelas (config-constrained), title, description (TEXT),
due_date (DATETIME nullable), status ('draft'|'published'|'closed'),
created_at, updated_at

Indexes: (academic_period_id), (ustadz_id, academic_period_id),
         (subject_id, kelas, academic_period_id)
```

### `submissions`
```
id, assignment_id (FK CASCADE), santri_id (FK RESTRICT),
submitted_at (DATETIME nullable), content (TEXT nullable),
file_path (nullable), original_file_name (nullable),
status ('draft'|'submitted'|'late'|'graded'),
score (DECIMAL nullable — reserved for P1-5),
created_at, updated_at

UNIQUE(assignment_id, santri_id)
Indexes: (santri_id), (assignment_id, status)
```

---

## Authorization Model Summary

### AssignmentPolicy
- `before()`: Admin → full access
- `viewAny()`: Ustadz and Santri (filtered by kelas/period in controller)
- `view()`: Ustadz → own; Santri → kelas match + published + active period
- `create()`: Ustadz only; teaching scope validated in Form Request
- `update()/delete()`: own assignment + active period only
- `publish()`: own + active period + currently `draft`

### SubmissionPolicy
- `before()`: Admin → full access
- `view()`: Santri → own; Ustadz → for their own assignments
- `create()`: Santri only; assignment validity validated in Form Request
- `update()`: Santri → own, status in `[draft, submitted]`, assignment still `published`
- `grade()`: Ustadz → for their own assignments (P1-5 use)

### Non-Negotiable Authorization Rules
1. Teaching scope verification in `StoreAssignmentRequest::authorize()` via Jadwal query (mirrors `StorePenilaianRequest`)
2. `academic_period_id` resolved server-side only — never from form input
3. All Ustadz writes check `active_period_id === AcademicPeriod::requireActive()->id`
4. Santri cannot submit to draft/closed assignments or those for another `kelas`

---

## Implementation Order (Post-Approval)

```
1. assignments migration + seeder
2. submissions migration + seeder
3. AssignmentPolicy
4. SubmissionPolicy
5. Form Requests (StoreAssignmentRequest, StoreSubmissionRequest)
6. Ustadz/AssignmentController + Ustadz/SubmissionController
7. Santri/AssignmentController + Santri/SubmissionController
8. Frontend (Inertia/React pages)
9. Feature tests (security-first, per §8 of architecture doc)
```

---

## Open Questions Requiring Stakeholder Decision Before Implementation

| ID | Question | Blocks |
|---|---|---|
| **O6** | Post-deadline resubmission: locked `late` or still updatable? | `StoreSubmissionRequest` |
| **O7** | Assignment visibility: all Santri in `kelas`, or only those with an active Jadwal row? | `AssignmentPolicy::view()` |
| **O8** | Admin assignment management: dedicated UI required in P1-3, or deferred? | Admin controller scope |
| **O9** | Santri file submission: required in P1-3 or text-only for initial release? | Frontend, `file_path` column usage |

---

## Risk Summary

| Risk | Severity | Mitigation |
|---|---|---|
| Over-coupling LMS with Penilaian (premature grade integration) | HIGH | No write path from `submissions` to `penilaians` in P1-3 by architectural decision |
| Historical data leakage (missing period filter in controller queries) | HIGH | Policy period checks + explicit test coverage in §8.3 |
| Assignment ownership ambiguity (co-teacher future requirement) | MEDIUM | Single-owner model documented; co-grader path is a named P2 trigger |
| Submission content bloat at scale | MEDIUM | Follow existing materis file-storage pattern; P2+ concern |
| `kelas` string drift on assignments | MEDIUM | `StoreAssignmentRequest` must validate against `config('pesantren.kelas')` |
| Future schema complexity from Question Bank (MCQ/Essay) | LOW | P1-3 schema deliberately minimal; additive migrations are non-breaking |

---

## What Was NOT Created

Per instructions:
- No application code modified
- No migrations created or modified
- No models created or modified
- No controllers created or modified
- No tests created or modified

Only two documentation files were created:
1. `docs/references/p1_lms_architecture.md` — full architecture document
2. `docs/references/p1_lms_architecture_review_summary.md` — this file

---

## Repository State

```
Branch: feature/p1-lms-architecture-review
Modified files (architecture docs only):
  docs/references/p1_lms_architecture.md          [NEW]
  docs/references/p1_lms_architecture_review_summary.md [NEW]

No commits made. Awaiting approval.
```

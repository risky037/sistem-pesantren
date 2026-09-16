# P1-3 LMS Architecture Refinement Summary

**Date:** 2026-09-15
**Branch:** `feature/p1-lms-architecture-refinement`
**Status:** PENDING APPROVAL — Do not implement until signed off.
**Full document:** `docs/references/p1_lms_architecture.md`
**Previous document:** `feature/p1-lms-architecture-review` → `p1_lms_architecture.md` (prior draft)

---

## Purpose

This document records the specific refinements made to `p1_lms_architecture.md` during the P1-3 architecture refinement phase. It explains *what changed*, *why*, and *what remains unchanged*.

No application code, migrations, models, controllers, or tests were created or modified. This is a documentation-only phase.

---

## Context Reconstruction

The previous architecture review session context was unavailable. The following documents were read to reconstruct context before editing:

- `AGENTS.md` — project-specific rules
- `README.md` — stack and current state
- `docs/PRD.md` — product requirements
- `docs/CURRENT_STATE.md` — implementation reality
- `docs/DESIGN.md` — design principles
- `docs/ROADMAP.md` — milestone plan
- `docs/references/p1_domain_decision_record.md` — approved P1 domain decisions
- `docs/references/p1_implementation_roadmap.md` — P1 milestone plan
- `docs/references/p1_academic_period_architecture.md` — temporal boundary architecture
- `docs/references/p1_2_santri_portal_architecture.md` — Santri portal architecture
- `docs/references/p1_lms_architecture.md` — prior LMS architecture draft
- `docs/references/p1_lms_architecture_review_summary.md` — prior review summary

Repository code verified:
- `database/migrations/2026_06_15_000003_create_penilaians_table.php`
- `app/Models/Penilaian.php`
- `app/Http/Controllers/Santri/GradeController.php`
- `app/Http/Controllers/Ustadz/PenilaianController.php`
- `app/Policies/PenilaianPolicy.php`

---

## Refinements Applied

### Refinement 1 — Assignment Status Terminology

**Change:** Replaced `published` with `open` in assignment status values.

**Before:** `draft | published | closed`

**After:** `draft | open | closed`

**Rationale:**

The term "published" creates semantic overlap with the grade publishing workflow (P1-6, currently deferred and not implemented). In this project's domain, "publishing" refers to making official academic grades visible to Santri — a distinct, deferred workflow. Using "published" for assignment availability risks:

1. Future maintainer confusion between assignment visibility and grade release.
2. Renaming churn when the grade publishing workflow is implemented in P1-6.
3. Inconsistency with the project's documented intent to defer the grade publishing workflow.

`open` unambiguously communicates that the assignment is accepting submissions, without implying any grade release workflow.

**Scope of change in document:**
- §2.3 — New section explaining the decision and lifecycle
- §3.1 — `assignments.status` default values updated to `draft | open | closed`
- §4.1 — `AssignmentPolicy` methods updated: `publish()` renamed to `open()`, `close()` added; `status === 'published'` replaced with `status === 'open'` throughout
- §4.2 — `SubmissionPolicy::update` condition updated: `assignment->status === 'open'`
- §8 — Step 1 migration notes updated; `open()` / `close()` action endpoints added to Step 7
- §9.1 — Test cases updated to reference `open` status
- §12 — Summary table updated

---

### Refinement 2 — Submission Status Lifecycle

**Change:** Removed `late` from submission status values. Lateness is now a derived condition, not a stored state.

**Before:** `draft | submitted | late | graded`

**After:** `draft | submitted | graded`

**Lateness derivation:**
```
is_late = submitted_at IS NOT NULL
        AND assignment.due_date IS NOT NULL
        AND submitted_at > assignment.due_date
```

**Rationale:**

1. **`late` is a temporal condition, not a workflow state.** Whether a submission is "late" is deterministic from two timestamps already stored (`submitted_at` and `assignment.due_date`). Storing it as a status column duplicates information and introduces a consistency risk if either timestamp is corrected.
2. **Transitioning to `late` requires infrastructure.** A background job or scheduled command would be needed to scan `submitted` submissions and mark them `late` at the due date — speculative infrastructure that the project's principles explicitly prohibit.
3. **Late submissions still become `graded`.** If `late` is a stored status, the lifecycle becomes `draft → submitted → late → graded`, requiring the grading path to handle an additional source state. The simpler `submitted → graded` path is more maintainable.
4. **Late submission policy is unresolved (O6).** Baking `late` into the schema pre-empts the stakeholder decision on whether late submissions are accepted, penalized, or blocked.

**MVP alignment:** Text-only submission is confirmed as the MVP-safe default. File upload (`file_path`, `original_file_name`) is deferred pending O9 stakeholder decision.

**Scope of change in document:**
- §2.5 — New section explaining the decision; `late` explicitly rejected with rationale
- §3.2 — `submissions.status` default values updated; lateness derivation shown; `file_path` column deferred
- §3.3 — `submissions.late` added to excluded columns table with [REJECTED] annotation
- §8 — Step 2 migration notes updated: no `file_path` column until O9 resolved
- §9.3 — Regression test updated: lateness derivation scenario added
- §12 — Summary table updated

---

### Refinement 3 — Penilaian Relationship Verification

**Change:** Clarified and reinforced the separation between LMS submission scores and `penilaians` as official academic records.

**No structural change.** The decision to keep LMS scores separate from `penilaians` was already approved. This refinement adds clearer language explaining the distinction:

> LMS submission scores are **operational assessment data** — they represent a work product submitted by a Santri for a specific task.
> `penilaians` records are **official academic records** — they represent the terminal grade for a Santri in a subject for a period.

**Scope of change in document:**
- §2.6 — "Critical separation rule" block added to reinforce the distinction
- §6.4 — Added explicit note that `is_published` on `penilaians` does not exist and is deferred to P1-6

---

### Refinement 4 — Grade Publishing Audit and Correction

**Change:** Audited and corrected an inaccurate claim in the prior review summary.

**Finding:**

The prior `p1_lms_architecture_review_summary.md` (line 31) listed:
```
penilaians.is_published + Ustadz grade release | COMPLETE
```

Repository verification disproves this claim:

| Evidence | Finding |
|---|---|
| `create_penilaians_table.php` migration | No `is_published` column |
| `app/Models/Penilaian.php` `$fillable` | No `is_published` |
| `app/Http/Controllers/Santri/GradeController.php` | No `is_published` filter; all penilaians returned |
| `app/Policies/PenilaianPolicy.php` | No grade release logic |
| `p1_2_santri_portal_architecture.md §7` | "grade publishing workflow and `is_published` column are treated as deferred product decisions" |

**Conclusion:** `penilaians.is_published` and the grade release workflow are **NOT implemented**. The "COMPLETE" claim was an error in the prior summary.

**Action taken:**
- §2.7 — New section titled "Grade Publishing — Repository Audit and Status" documents the audit finding and correction
- §6.4 — Integration with Penilaian section notes explicitly that `is_published` does not exist
- §3.3 — Excluded columns table notes `penilaians.is_published` as [DEFERRED — P1-6]
- §9.4 — Regression test updated: no `is_published` toggle test (since it doesn't exist)
- §12 — Summary table reflects [DEFERRED — P1-6] for `penilaians.is_published`

**No impact on P1-3 LMS architecture.** The LMS does not depend on `is_published`. The correction is documentary only.

---

### Refinement 5 — Database Design Refinement

**Confirmed decisions (no change required):**

| Column | Decision |
|---|---|
| `assignments.academic_period_id NOT NULL` | Confirmed — consistent with all P1 temporal anchors |
| `assignments.subject_id` | Confirmed — required for teaching-scope ownership |
| `assignments.ustadz_id` | Confirmed — required for ownership boundary |
| `assignments.kelas` | Confirmed — config-constrained; authorization chain depends on this matching `santris.kelas` |
| `assignments.title` | Confirmed |
| `assignments.description` | Confirmed — nullable TEXT; serves as free-form instructions until Question Model is designed |
| `assignments.due_date` | Confirmed — nullable DATETIME; null = no deadline |
| `assignments.status` | Updated — `draft | open | closed` (see Refinement 1) |

**`max_score` decision:**

`assignments.max_score` is **excluded from P1-3** with documented future migration path:

- The grading scale (O5) is unresolved. Storing `max_score` without a confirmed policy creates misleading schema.
- Adding `max_score DECIMAL(5,2) NULLABLE` in P1-5 is a non-breaking additive migration.

**File attachment decision:**

`submissions.file_path` and `submissions.original_file_name` are **excluded from core P1-3 schema** pending O9:

- Text-only submission is the MVP-safe default.
- If O9 resolves in favor of file upload, these columns are additive and non-breaking.

---

### Refinement 6 — Authorization Refinement

**Confirmed:**

- `AssignmentPolicy::before()` — Admin has full access.
- Ustadz — own assignments only, active period only.
- Santri — `open` assignments for their `kelas` in the active period only.
- `SubmissionPolicy` — Santri own submissions only; Ustadz only for their own assignments.
- `academic_period_id` injection prevention — server-side only.
- `santri_id` injection prevention — resolved from `$request->user()->santri->id`.
- `assignment_id` manipulation prevention — `StoreSubmissionRequest::authorize()` validates kelas match and period.

**New explicit additions:**

- `santri_id` injection prevention is now an explicit numbered rule (Rule 6).
- `assignment_id` manipulation prevention is now an explicit numbered rule (Rule 7).
- Authorization boundary summary table (§4.4) added for clarity.
- `AssignmentPolicy::publish()` renamed to `open()`. `close()` added as a distinct method.

---

### Refinement 7 — Scope Boundary Confirmation

**Confirmed excluded:**
- Attendance
- Messaging / LMS chat
- Push / in-app notifications
- Grade publishing workflow (`is_published`) — deferred P1-6, not implemented
- Advanced assessment calculation
- Automatic MCQ grading
- Flexible question model (separate design task)
- Santri grade history with publish gate
- Co-teacher / multi-grader support

A dedicated §7 "Scope Boundary Confirmation" table was added to `p1_lms_architecture.md` to make exclusions unambiguous.

---

### Refinement 8 — Architecture Quality Check

**Verified:**

| Check | Result |
|---|---|
| No contradiction with P1 domain decisions (`p1_domain_decision_record.md`) | ✅ Pass — composite teaching scope, period NOT NULL, jadwal as implicit scope |
| No contradiction with academic period architecture | ✅ Pass — `requireActive()` used at all write paths; Admin bypasses period restriction |
| No unnecessary abstractions introduced | ✅ Pass — direct Eloquent in controllers; no repository/service layers |
| Implementation can be split into independent PRs | ✅ Pass — 10-step dependency graph in §8; each step independently committable |
| `published` terminology removed | ✅ Pass — replaced with `open` throughout |
| `late` as primary submission status removed | ✅ Pass — replaced with derived temporal condition |
| `is_published` false claim corrected | ✅ Pass — audit documented in §2.7; removed from "COMPLETE" status |
| Grade publishing workflow not introduced | ✅ Pass — explicitly deferred and excluded |

---

## What Was NOT Changed

The following architectural decisions from the prior draft remain unchanged:

| Decision | Status |
|---|---|
| Assignment ownership: Composite teaching scope (Option C) | Unchanged — confirmed |
| `academic_period_id NOT NULL` on assignments | Unchanged — confirmed |
| One submission per Santri per assignment (UNIQUE constraint) | Unchanged — confirmed |
| LMS scores separate from `penilaians` | Unchanged — confirmed |
| Direct Eloquent; no service/repository layer | Unchanged — confirmed |
| Question bank / MCQ / Essay deferred | Unchanged — confirmed |
| Open items O6, O7, O8, O9 | Unchanged — still require stakeholder decision |
| 10-step implementation order | Unchanged in structure; action names updated for `open`/`close` |
| Testing strategy structure | Unchanged in structure; test cases updated for `open` status |

---

## Files Modified

```
Branch: feature/p1-lms-architecture-refinement
Modified files (architecture docs only):
  docs/references/p1_lms_architecture.md          [UPDATED — refined]
  docs/references/p1_lms_architecture_refinement_summary.md [NEW]

No application code modified.
No migrations created or modified.
No models created or modified.
No controllers created or modified.
No tests created or modified.

No commits made. Awaiting approval.
```

---

## Open Questions Still Requiring Stakeholder Decision

| ID | Question | Blocks |
|---|---|---|
| **O6** | Post-deadline resubmission: structurally locked, or policy-governed with lateness derived? | `StoreSubmissionRequest` late-submission handling |
| **O7** | Assignment visibility: all Santri in `kelas`, or only those with an active Jadwal row for the subject? | `AssignmentPolicy::view()` for Santri |
| **O8** | Admin assignment management: dedicated UI in P1-3, or database-level only? | Admin controller scope (Step 6) |
| **O9** | Santri file submission: required in P1-3 or text-only for initial release? | `file_path` column, frontend file upload component |

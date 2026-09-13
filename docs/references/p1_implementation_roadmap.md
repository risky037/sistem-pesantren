# P1 Implementation Roadmap

**Date:** 2026-09-13
**Status:** DRAFT (Pending Stakeholder Decisions)
**Based on:** `p1_domain_decision_record.md`

This document translates the approved P1 domain architecture into incremental, independently mergeable, PR-sized milestones.

## Stakeholder Blockers

Before implementation can begin on specific milestones, the following operational decisions must be provided by stakeholders:

| ID | Question | Blocks Milestone |
|---|---|---|
| **O1** | **`santris.email` Semantics:** Is this the guardian contact email or a duplicate of the login email? | P1-0 |
| **O2** | **Valid `kelas` Identifiers:** What are the exact class names (e.g., `X-A`, `XI-B`) used by this pesantren? | P1-0 |
| **O3** | **Semester Activation UX:** Does Admin click a button to activate the new term, or is it automated? | P1-1 |
| **O4** | **Grade Release Granularity:** Does Ustadz publish grades per Santri, per class, or per subject? | P1-2 |
| **O5** | **Grading Formula:** What are the weights for Tugas/UTS/UAS and the KKM? | P1-2 (Optional), P1-3 |

---

## Milestone P1-0: Domain Safety Foundation

**Goal:** Close immediate authorization gaps, fix active regressions, and prepare the schema for temporal scoping.

**Prerequisites:** Stakeholder decisions O1 and O2.

### Tasks
1. **Santri Login Verification:** Verify Santri dashboard (implemented in P0-1B.4) loads correctly to ensure no 500 errors or regressions on login.
2. **Email Semantics Resolution:** Rename `santris.email` to `email_wali` (if decided) or remove it. Update `StoreSantriRequest`, `UpdateSantriRequest`, and seeder.
3. **`kelas` Configurable Validation:** Apply configurable string validation (e.g., `in:X-A,XI-B`) in Form Requests (`StoreSantriRequest`, `StoreJadwalRequest`, etc.) based on stakeholder input, rather than introducing a hardcoded PHP enum yet. Document this approach for future migration if needed.
4. **`hari` Constraint:** Create `App\Enums\HariEnum`. Update form validation for `jadwals.hari`.

### Test Requirements
- Assert Santri login correctly resolves to the implemented dashboard with a 200 OK.
- Assert validation fails if invalid `kelas` or `hari` string is submitted.

### Rollback Risks
- **Low.** No structural FK changes. Changes are additive constraints at the application validation layer.

---

## Milestone P1-1: Academic Period Integration

**Goal:** Establish the temporal anchor and enforce period-scoped uniqueness and teaching boundaries.

**Prerequisites:** P1-0 complete. Stakeholder decision O3.

### Tasks
1. **Create `academic_periods`:** Create table migration including `start_date` and `end_date` columns, and seed a default active period (`is_active = true`).
2. **`jadwals` Integration:** Add `academic_period_id` (NOT NULL, RESTRICT). Add composite unique constraint `(user_id, subject_id, kelas, hari, jam_mulai, academic_period_id)`.
3. **`penilaians` Integration:** Add `academic_period_id` (NOT NULL, RESTRICT). Update existing composite unique key to include the period.
4. **`materis` Integration:** Add `academic_period_id` (Nullable, SET NULL).
5. **Teaching Scope Enforcement:** Update `Jadwal::where(...)` queries in `PenilaianController` and `MateriController` to filter by `AcademicPeriod::active()->id`.

### Migration Dependency Order
1. `create_academic_periods_table`
2. **Data Migration Strategy:** Before enforcing NOT NULL constraints, seed a default active period and update existing records in `jadwals`, `penilaians`, and `materis` to reference it.
3. Update `jadwals` (depends on 1 & 2)
4. Update `penilaians` (depends on 1 & 2)
5. Update `materis` (depends on 1 & 2)
*All require `migrate:fresh --seed`.*

### Test Requirements
- Assert `PenilaianController` only shows subjects from the active academic period.
- Assert duplicate grades in the *same* period are rejected.
- Assert identical grade entries for the *same* Santri/Subject in *different* periods are accepted.
- **Authorization Regression Testing:** Assert horizontal boundaries hold (e.g. Ustadz cannot edit materials/grades belonging to another Ustadz's period-scoped assignment).

### Rollback Risks
- **High.** Affects core relational structure and composite unique keys. Requires `migrate:fresh --seed` to safely roll forward or backward in development.

---

## Milestone P1-2: Santri Portal Foundation

**Goal:** Deliver the first iteration of the authenticated Santri experience (read-only portal) and grade release controls.

**Prerequisites:** P1-1 complete. Stakeholder decisions O4 and O5.

### Tasks
1. **Grade Release Schema:** Add `is_published` (boolean, default false) to `penilaians`.
2. **Ustadz UI:** Implement "Release Grades" action in Ustadz grading dashboard based on granularity decision (O4).
3. **Santri Schedule View:** Read-only view of `jadwals` where `kelas` matches Santri and `academic_period_id` is active.
4. **Santri Materi Browser:** Read-only view of `materis` matching `kelas` and active period (or null period).
5. **Santri Gradebook:** Read-only view of `penilaians` where `is_published = true`.

### Test Requirements
- Assert Santri cannot view unpublished grades.
- Assert Santri only sees schedule/materis for their current `kelas`.
- Assert Ustadz can toggle `is_published` state.

### Rollback Risks
- **Medium.** Additive schema change (`is_published`). New routes/controllers for Santri are isolated and easily disabled if necessary.

---

## Milestone P1-3: LMS Preparation (Deferred)

**Goal:** Establish structural anchors for future advanced LMS capabilities (Assignments and Submissions).

**Status:** DEFERRED until P1-2 is fully stable in production.

### Anticipated Scope
1. **`assignments` Table:** Linked to Ustadz, Subject, Period, and Class.
2. **`submissions` Table:** Linked to Assignment and Santri, with status lifecycle.
3. **Grading Engine Extension:** Integration of grading formula (O5) and calculation services.

*Detailed tasks and tests for this milestone will be defined after P1-2 delivery.*

# P1 Domain Foundation Architecture Review

**Date:** 2026-09-13
**Status:** Design Only — No Implementation
**Prerequisites:** All P0 milestones completed and verified.
**Branch context:** `chore/final-stabilization-cleanup` (docs only; this document is the output)

---

## Purpose

This document evaluates the current academic domain model against the requirements of the P1 feature roadmap (Santri portal, LMS capabilities) and proposes structural foundations that must be in place before P1-1 feature development begins. It does not prescribe implementation of P1 features — it identifies the preparatory domain decisions that will govern how those features are built.

---

## Notation

- **FACT:** A verified observation grounded in the current codebase or schema.
- **RECOMMENDATION:** A design decision with reasoned justification. Not yet approved.
- **TRADE-OFF:** A deliberate compromise between two legitimate options. Requires stakeholder resolution.

---

## 1. Current Academic Domain — Verified State

### 1.1 Schema as Built

```
subjects
  id, kode_mapel (unique), nama_mapel, deskripsi

jadwals
  id, user_id (FK→users RESTRICT), subject_id (FK→subjects RESTRICT),
  hari (string), jam_mulai (time), jam_selesai (time),
  kelas (string), ruang (nullable string)
  Composite unique: NONE

materis
  id, user_id (FK→users RESTRICT), subject_id (FK→subjects RESTRICT),
  judul, deskripsi, kelas (nullable string),
  file_path (nullable), original_file_name (nullable),
  published_at (date nullable)

penilaians
  id, user_id (FK→users RESTRICT), santri_id (FK→santris RESTRICT),
  subject_id (FK→subjects RESTRICT),
  tugas, uts, uas, nilai_akhir (decimal 5,2), catatan
  Composite unique: (santri_id, subject_id, user_id)

santris
  id, user_id (FK→users RESTRICT, UNIQUE), nis (unique), nama,
  jenis_kelamin, tanggal_lahir, alamat, kelas (string),
  program (nullable), status (aktif/alumni/keluar),
  email (nullable, unindexed, semantics unresolved), telepon
```

**FACT:** There is no `academic_periods`, `academic_years`, or `semesters` table. All data accumulates without temporal boundaries.

**FACT:** `jadwals.hari` is a free-form string. The seeder uses Indonesian day names (`'Senin'`, `'Selasa'`, etc.) but no constraint enforces this.

**FACT:** `jadwals.kelas` and `santris.kelas` are free-form strings. The grading boundary enforcement in `StorePenilaianRequest` relies on string equality between `jadwals.kelas` and `santris.kelas`. A case difference or typo creates a silent authorization bypass.

**FACT:** `jadwals` has no composite unique constraint. Multiple Jadwal rows can reference the same `(user_id, subject_id, hari, jam_mulai, kelas)` combination.

**FACT:** `subjects` has no `tingkat` (grade level) or classification column. A subject like "Fiqih" is global across all grade levels.

**FACT:** The `penilaians` composite unique `(santri_id, subject_id, user_id)` scopes a grade row to one Ustadz per Santri per Subject. There is no semester or academic year dimension in this key — grades from different years would collide.

**FACT:** `materis.kelas` is nullable and not constrained. Material visibility for Santri is evaluated by string equality (`$user->santri->kelas === $materi->kelas`) in `MateriPolicy`.

---

## 2. Academic Period Modeling

### 2.1 Current Problem

**FACT:** No temporal scoping exists. All of the following accumulate indefinitely without partition:
- `penilaians` rows — a student has one grade row per `(santri_id, subject_id, user_id)` across all of time.
- `jadwals` rows — schedules from a previous school year are indistinguishable from the current year.
- `materis` rows — materials uploaded in a prior year appear alongside current-year materials for the same subject.

**FACT:** The `penilaians` composite unique index `(santri_id, subject_id, user_id)` enforces uniqueness without a time dimension. Re-entering grades for the same subject in a new semester would hit the unique constraint and silently `updateOrCreate` over the previous year's grades.

**RECOMMENDATION:** Introduce an `academic_periods` table as the temporal scope anchor for all academic domain records.

### 2.2 Proposed `academic_periods` Model

```sql
academic_periods
  id
  tahun_ajaran     varchar(9)   NOT NULL   -- e.g., '2025/2026'
  semester         enum('Ganjil','Genap')  NOT NULL
  is_active        boolean      NOT NULL   DEFAULT false
  started_at       date         nullable
  ended_at         date         nullable
  created_at, updated_at

UNIQUE (tahun_ajaran, semester)
```

**RECOMMENDATION:** At most one `academic_period` row should have `is_active = true` at any given time. Application code should enforce this at the service layer (set others to `false` when activating a new period) rather than at the database level to avoid complex trigger logic.

**TRADE-OFF:** Using a single `is_active` boolean vs. using a date-range overlap check to determine the "active" period.
- **Boolean:** Simple. Requires Admin to explicitly activate/deactivate. Risk: can be left in stale state.
- **Date range:** Automatic based on `started_at`/`ended_at`. Risk: queries become more complex (`WHERE NOW() BETWEEN started_at AND ended_at`), and handling overlaps requires careful validation.
- **Recommendation:** Start with the `is_active` boolean for simplicity and institutional fit. A pesantren Admin explicitly activates the new semester. Add date fields for reference only in Phase 1; evolve to date-range if operational evidence supports it.

### 2.3 Period-Scoped Domain Records

Once `academic_periods` exists, the following tables require an `academic_period_id` FK:

| Table | Impact | FK cardinality |
|-------|--------|----------------|
| `jadwals` | Each schedule slot belongs to one period | RESTRICT (do not delete periods with active jadwals) |
| `materis` | Materials published within a period | SET NULL acceptable (materials survive period deletion) |
| `penilaians` | Grades belong to a specific period; unique key expands | RESTRICT |

**RECOMMENDATION:** When `academic_period_id` is added to `penilaians`, the composite unique key must be updated to `(santri_id, subject_id, user_id, academic_period_id)`. This allows the same Ustadz to record grades for the same Santri in the same subject across different semesters.

**TRADE-OFF:** Making `academic_period_id` NOT NULL vs. nullable on existing tables.
- **NOT NULL:** Enforces correctness. Requires all existing data to be assigned to a period during migration. Since we are in the active development phase (`migrate:fresh --seed` policy), this is feasible.
- **Nullable:** Easier migration, but allows orphan records without a period. More technical debt.
- **Recommendation:** NOT NULL with a seeded default period (`2025/2026 Ganjil`). This is correct and achievable within the active development migration policy.

---

## 3. Class/Kelas Modeling

### 3.1 Current Problem

**FACT:** `kelas` appears as a free-form string in three locations:
1. `santris.kelas` — the Santri's enrolled class.
2. `jadwals.kelas` — the class a Jadwal slot targets.
3. `materis.kelas` — the class a Materi is published for (nullable).

**FACT:** The authorization boundary in `StorePenilaianRequest::authorize()` and `MateriPolicy::view()` depends on string equality between `jadwals.kelas` and `santris.kelas`. A typo or case difference silently breaks this boundary.

**FACT:** The seeder uses formats like `'XII-A'`, `'XI-A'`, `'XI-B'`, `'XII-B'`. There is no enforcement preventing `'12-A'`, `'xii-a'`, or `'Kelas XII A'` from entering the database.

### 3.2 Evaluation: Dedicated `classes` Table vs. Constrained String

**TRADE-OFF:** Introduce a `classes` table (a proper entity) vs. constrain the existing string column.

**Option A — Dedicated `classes` table:**
```sql
classes
  id
  nama_kelas    varchar(20)   NOT NULL UNIQUE  -- e.g., 'XII-A'
  tingkat       tinyint       NOT NULL          -- 10, 11, 12
  academic_period_id FK (if classes are per-period)
```
Then `santris.kelas_id`, `jadwals.kelas_id`, and `materis.kelas_id` become FKs.

- **Pro:** Full referential integrity, enforces consistent naming, enables aggregate queries by class.
- **Con:** Increases schema complexity. Admin must now manage `classes` as a master data entity. Students changing classes between periods require a new FK value or an enrollment history table.
- **When justified:** When the system needs per-class scheduling, cohort reporting, or enrollment tracking over time.

**Option B — Constrained string (PHP Enum or DB check):**
```php
enum Kelas: string {
    case KelasX_A = 'X-A';
    case KelasX_B = 'X-B';
    // ...
}
```
Or a DB `CHECK` constraint listing valid values.

- **Pro:** Simple. No new table. Enforces consistency without changing FK structure.
- **Con:** Rigid. Adding a new class requires a code/migration change. Does not support per-period enrollment history.
- **When justified:** For institutions with a fixed, stable set of classes that do not change semester-to-semester.

**RECOMMENDATION:** For P1-1, use a constrained string approach via a PHP-backed enum. This removes the typo risk without introducing premature complexity. Re-evaluate for a dedicated `classes` table only when the system needs enrollment history or per-class reporting that cannot be served by the enum.

**RECOMMENDATION:** Define the class name format convention (e.g., `'X-A'`, `'XI-B'`) and enforce it via a PHP `KelasName` enum or a validation rule applied consistently in all Form Requests that write to `kelas` columns. This is a one-migration change to add a `CHECK` constraint or a trivial application-level validation addition.

### 3.3 Student Class Enrollment

**FACT:** A Santri's class is stored as a single `santris.kelas` string. There is no enrollment history — when a student advances from `XI-A` to `XII-A`, the `kelas` field is overwritten. Previous year's grades in `penilaians` retain `santri_id` but the `kelas` context is lost from the Santri record.

**RECOMMENDATION:** For P1, this single-field enrollment model is acceptable as long as `penilaians` is scoped by `academic_period_id`. The grade record's period provides the temporal context even if `santris.kelas` is overwritten. A formal enrollment table (`enrollments`) is a P2 concern, deferred until the system needs to answer "what class was Santri X in during period Y?"

---

## 4. Subject Assignment and Teaching Scope

### 4.1 Current Model

**FACT:** The Ustadz-to-subject teaching relationship is modeled entirely through `jadwals`. There is no explicit `ustadz_subjects` or `teaching_assignments` join table.

**FACT:** `jadwals` rows encode: which Ustadz (`user_id`) teaches which Subject (`subject_id`) for which Class (`kelas`) on which Day (`hari`) at which Time (`jam_mulai`/`jam_selesai`). The schedule IS the teaching assignment.

**FACT:** `PenilaianController@index` derives "subjects this Ustadz teaches" by querying `Jadwal::where('user_id', $userId)->pluck('subject_id')->unique()`. This correctly derives teaching scope from schedule ownership.

**FACT:** `StorePenilaianRequest::authorize()` validates that all submitted Santri IDs are in a class that the Ustadz has a Jadwal for, for the given subject. This is the current authorization boundary for grading.

### 4.2 Current Problems

**FACT:** The Jadwal query in `PenilaianController` (`Jadwal::where('user_id', $userId)->pluck('subject_id')`) has no period scope. An Ustadz who taught Fiqih in a prior year will continue to see Fiqih in their Penilaian dashboard even after they are no longer assigned to it.

**FACT:** `UstadzDashboardController` computes `totalSantri` as `Santri::count()` — the total of all santri in the system, not those in the Ustadz's assigned classes. This is a display-only inaccuracy that will become more misleading as data grows.

**FACT:** `jadwals` has no composite unique constraint. Nothing prevents two Jadwal rows for the same Ustadz, Subject, Class, and Day at overlapping times.

### 4.3 Teaching Scope with Period Context

**RECOMMENDATION:** When `academic_period_id` is added to `jadwals`, all teaching scope derivations (Penilaian, Materi, dashboard stats) must filter by the active period:
```php
Jadwal::where('user_id', $userId)
    ->where('academic_period_id', AcademicPeriod::active()->id)
    ->pluck('subject_id')
    ->unique();
```

**RECOMMENDATION:** Add a composite unique constraint to `jadwals` to prevent duplicate schedule entries:
```
UNIQUE (user_id, subject_id, kelas, hari, jam_mulai, academic_period_id)
```
This prevents scheduling the same Ustadz for the same Subject, Class, Day, and Start Time within the same period.

**TRADE-OFF:** Whether the `jadwals` unique constraint should include `academic_period_id`.
- **With period:** Allows the same time slot to be reused in a new period (correct behavior).
- **Without period:** More restrictive, but would prevent a sensible recurring schedule.
- **Recommendation:** Include `academic_period_id` in the unique constraint. Period-scoped uniqueness is the correct semantic.

### 4.4 Subject Grade Level (`tingkat`)

**FACT:** `subjects` has no `tingkat` (grade level) column. A subject like "Fiqih" is global — it appears as an option for any class assignment regardless of whether it is a grade-10 or grade-12 subject.

**RECOMMENDATION:** Do not add `tingkat` to `subjects` prematurely. The `jadwals` table already encodes which class (`kelas`) a subject is taught to via a specific schedule slot. The combination `(subject_id, kelas)` in a Jadwal row provides the grade-level context implicitly. A formal `tingkat` column on `subjects` adds value only when the system needs to filter subject catalog by grade level independently of scheduling — defer to when that requirement is demonstrated.

---

## 5. LMS Compatibility Evaluation

### 5.1 What LMS Features the PRD Describes (Phase 1–2)

From PRD Section 3.6 and ROADMAP P1:
1. **Materi (learning materials):** Already implemented — Ustadz upload files, Santri download.
2. **Assignments (`tugas`):** Ustadz create structured assignments with deadlines and instructions.
3. **Question Bank:** Multiple-choice and essay question formats.
4. **Santri Submissions:** Digital submission with status lifecycle (Draft, Submitted, Late, Graded).
5. **Grade Release:** Ustadz reviews submissions, finalizes grades, releases to Santri.
6. **Santri Gradebook:** Santri views published grades and evaluation history.

### 5.2 Compatibility Assessment of Current Schema

| LMS Domain | Current Support | Gap |
|---|---|---|
| Materials (`materis`) | **Implemented.** `user_id`, `subject_id`, `kelas`, `file_path`, `published_at` exist. | No `academic_period_id` → materials from past years mix with current. No visibility control (draft vs published status). `published_at` is a date field, not a lifecycle state. |
| Assignments | **Not modeled.** No table exists. | Requires new `assignments` table with `user_id`, `subject_id`, `kelas`, `academic_period_id`, `judul`, `instruksi`, `deadline`, `is_published`. |
| Question Bank | **Not modeled.** | Requires `questions` table with `type enum(pilihan_ganda, esai)`, `body`, answer metadata. Complex — defer to P1-3 as specified in ROADMAP. |
| Submissions | **Not modeled.** | Requires `submissions` table linked to `assignments` and `santris`. Needs status lifecycle. |
| Grade Recording (current) | **Implemented.** `penilaians` stores `tugas`, `uts`, `uas`, `nilai_akhir` per `(santri_id, subject_id, user_id)`. | No `academic_period_id` dimension — same unique key for all years. No grade release/publishing workflow. `nilai_akhir` is computed ad-hoc in the controller (simple average) rather than enforced by a configurable weighting formula. |
| Santri Gradebook | **Not implemented.** | Requires Santri portal routes and views (P1-1). `penilaians` data exists but Santri has no route to read it. |

### 5.3 The `penilaians` Table as the Grade Contract

**FACT:** The current `penilaians` table stores three raw score components (`tugas`, `uts`, `uas`) and a calculated `nilai_akhir`. The calculation is a simple average performed in `PenilaianController@store`:
```php
$nilaiAkhir = round(($tugas + $uts + $uas) / $count, 2);
```

**FACT:** PRD Section 6, Q4 states: "Grading Scale & Passing Criteria: Finalize the standardized grading scale, weighting rules (Tugas/UTS/UAS), and minimum passing scores (*KKM*)." This is still open.

**RECOMMENDATION:** Do not add a configurable grading formula engine prematurely. Keep the `penilaians` schema as-is for P1. When the weighting policy is formally decided (PRD Q4), the calculation logic can be extracted to a dedicated method or service without schema changes. The raw scores (`tugas`, `uts`, `uas`) are already stored separately, enabling retroactive recalculation.

**TRADE-OFF:** Whether `penilaians` should support a "published" / "released" state for the Santri gradebook.
- **Option A — Add `is_published boolean` to `penilaians`:** Santri can only see grades with `is_published = true`. Simple. Ustadz explicitly releases grades.
- **Option B — Santri sees all grades immediately:** No publishing step. Simpler implementation; less control for Ustadz.
- **Recommendation:** Implement `is_published` for the Santri gradebook in P1-1. The PRD (Section 3.6) explicitly describes a "Grade Release workflow." Santri should not see grades mid-grading-session. This is a one-column migration addition.

### 5.4 Assignments and Submissions — Structural Anchors

**RECOMMENDATION:** When the `assignments` and `submissions` tables are designed (P1-2+), the following FK anchors from the current schema should be maintained:

```
assignments
  id
  user_id          FK→users (Ustadz who created it)
  subject_id       FK→subjects
  academic_period_id FK→academic_periods
  kelas            string (or kelas_id if formalized)
  judul, instruksi, tipe (text|file|mixed)
  deadline         datetime nullable
  is_published     boolean default false
  created_at, updated_at

submissions
  id
  assignment_id    FK→assignments RESTRICT
  santri_id        FK→santris RESTRICT
  status           enum(draft, submitted, late, graded)
  submitted_at     datetime nullable
  file_path        nullable
  catatan          text nullable
  nilai            decimal(5,2) nullable
  graded_at        datetime nullable
  graded_by        FK→users nullable (Ustadz who graded)
  created_at, updated_at

  UNIQUE (assignment_id, santri_id)
```

**FACT:** These tables are not needed before P1-1 (Santri portal foundation). They are scoped to P1-2+ in the ROADMAP. This section documents the anticipated FK relationships so P1-1 work does not create incompatible structures.

---

## 6. Migration Impact of P1 Foundations

The following schema changes are prerequisites for P1 feature work. All changes are safe under the active development migration policy (`migrate:fresh --seed`).

### Phase P0-4 (Next) — Required Before P1

| Change | Migration | Impact |
|--------|-----------|--------|
| Add `academic_periods` table | New migration | No FK changes yet; establishes the anchor |
| Add `academic_period_id` to `jadwals` (NOT NULL) | Edit existing migration | Seeder must create and reference a default period |
| Add `academic_period_id` to `penilaians` (NOT NULL) | Edit existing migration | Unique key must be updated to include period |
| Add `academic_period_id` to `materis` (nullable first, then NOT NULL after seeder validation) | Edit existing migration | Backward-compatible if nullable in migration |
| Add composite unique to `jadwals` `(user_id, subject_id, kelas, hari, jam_mulai, academic_period_id)` | Edit existing migration | Prevents duplicate schedule entries |
| Constrain `jadwals.hari` to valid day names | Edit existing migration | Add PHP enum `HariEnum` and Form Request validation |
| Resolve `santris.email` semantics (rename or remove) | Edit existing migration | Blocks Santri create form clarity |

### Phase P1-1 — Required for Santri Portal

| Change | Migration | Impact |
|--------|-----------|--------|
| Create `resources/js/Pages/Santri/Dashboard.jsx` (CRITICAL — stub exists with no page) | Frontend only | Unblocks any Santri login |
| Add `is_published` to `penilaians` | Edit existing migration | Enables grade release workflow |
| Santri portal routes: schedule view, materi download, penilaian view | New routes | Requires Santri-facing controllers |

### Phase P1-2+ — Assignments and Submissions

| Change | Migration | Impact |
|--------|-----------|--------|
| New `assignments` table | New migration | Depends on `academic_period_id` being in place |
| New `submissions` table | New migration | Depends on `assignments` |

---

## 7. Risks

| Risk | Classification | Severity | Mitigation |
|------|----------------|----------|------------|
| **`penilaians` unique key collision across years** — the current `(santri_id, subject_id, user_id)` key will silently overwrite prior-year grades when a new semester begins | FACT (current bug) | **HIGH** | Add `academic_period_id` to the unique key before any multi-period data entry occurs |
| **`kelas` string typo breaks authorization** — `StorePenilaianRequest` and `MateriPolicy` rely on string equality between `jadwals.kelas` and `santris.kelas` | FACT (current deficiency) | **HIGH** | Constrain `kelas` values via PHP enum or DB CHECK before P1-1 Santri portal work begins |
| **Jadwal scope without period** — teaching scope queries that lack `academic_period_id` will include prior-year assignments | FACT (latent, becomes real at first period transition) | **MEDIUM** | Becomes a P0-4 blocker; must be resolved before the second academic period is entered |
| **Santri login broken** — `santri.dashboard` route exists but `Santri/Dashboard.jsx` does not | FACT (current regression) | **CRITICAL** | Immediately create a stub React page before any Santri accounts are activated |
| **Grade release control absent** — Santri will see grades mid-session without `is_published` | RECOMMENDATION gap | **MEDIUM** | Implement `is_published` in P1-1 |
| **`santris.email` semantics unresolved** — column exists but is orphaned from the create form | FACT (open since P0-1B.4) | **MEDIUM** | Resolve before P1-1 Santri portal (the Santri profile page will surface this ambiguity) |
| **Dashboard `totalSantri` counts all santri, not Ustadz's scope** | FACT (display inaccuracy) | **LOW** | Fix in P0-5 CRUD audit; becomes more confusing after period scoping is added |
| **No duplicate Jadwal constraint** — Admin can create overlapping schedule entries | FACT (missing DB constraint) | **LOW** | Add composite unique in P0-4 |
| **LMS grading formula undefined** — PRD Q4 open | RECOMMENDATION pending | **LOW** | Keep calculation in controller for now; extract when policy is finalized |
| **Enum for `semester` forces code change for new values** | TRADE-OFF | **LOW** | Acceptable — Indonesian pesantren uses Ganjil/Genap universally; a third semester is an edge case |

---

## 8. Implementation Sequence

This sequence is ordered by dependency and risk priority. It does not prescribe implementation within each step — that belongs to the implementation plan for each feature.

### Step 1 — Immediate (Critical, Before Any Santri Activation)

1. Create `resources/js/Pages/Santri/Dashboard.jsx` — a minimal stub page so Santri login does not 500.
2. Resolve `santris.email` semantics: rename to `email_wali` (guardian email) or remove. Update seeder. Update `StoreSantriRequest`. Update `UpdateSantriRequest`.

### Step 2 — P0-4 Foundation (Before P1 Feature Work)

3. Create `academic_periods` table migration. Seed a default active period (`2025/2026 Ganjil`).
4. Add `academic_period_id` FK to `jadwals` (NOT NULL). Update seeder. Update `StoreJadwalRequest`. Add composite unique.
5. Constrain `jadwals.hari` — define `HariEnum` PHP enum, apply in `StoreJadwalRequest` and `UpdateJadwalRequest`.
6. Add `academic_period_id` FK to `penilaians` (NOT NULL). Update unique key. Update seeder and `StorePenilaianRequest`.
7. Add `academic_period_id` FK to `materis` (nullable). Update seeder and `StoreMateriRequest`.
8. Add helper method `AcademicPeriod::active(): ?AcademicPeriod` (or a scoped query) for use in controllers.
9. Update teaching scope queries in `PenilaianController` and `MateriController` to filter by active period.

### Step 3 — P0-5 CRUD Audit

10. Fix `UstadzDashboardController` `totalSantri` to count only Santri in the Ustadz's assigned classes (via Jadwal).
11. Confirm all listing queries are paginated and period-scoped where relevant.
12. Audit `SubjectController@destroy` — currently deletes a Subject with no dependent-record check. `subjects` is referenced by `jadwals`, `materis`, `penilaians` all with RESTRICT FK. The FK will block deletion at the DB level, but the application should surface a user-friendly error rather than a 500.

### Step 4 — P1-1 Santri Portal

13. Add `is_published boolean default false` to `penilaians`.
14. Implement Santri portal: authenticated layout, schedule view (own class via Jadwal + active period), materi browser (own kelas, active period), grade view (`is_published = true` only).
15. Implement Ustadz grade release action (set `is_published = true` per subject/period).

### Step 5 — P1-2+ LMS Assignments

16. Design and implement `assignments` table (requires steps 2–4 complete).
17. Design and implement `submissions` table (requires `assignments`).

---

## 9. Open Decisions Requiring Stakeholder Resolution

> [!IMPORTANT]
> The following items cannot be resolved by engineering alone. They require institutional policy decisions before the associated domain can be implemented.

| # | Decision | Blocks |
|---|----------|--------|
| D1 | **`santris.email` semantics** — is this the guardian/wali contact email, or a duplicate of `users.email`? If guardian email, rename to `email_wali`. If duplicate, remove. | P1-1 Santri profile page |
| D2 | **Academic period transition process** — how does the Admin activate a new semester? Is there a batch promotion workflow (all `aktif` Santri advance to next class)? Or is class assignment always manual? | P0-4 `academic_periods` seeder and UI |
| D3 | **Grading formula and KKM** — what are the weights for Tugas/UTS/UAS? Is `nilai_akhir` a simple average or weighted? What is the minimum passing score (`KKM`)? | P1-5 grading display |
| D4 | **Grade release granularity** — does `is_published` apply per-Santri-per-Subject, or per-Subject-per-Class (Ustadz releases grades for the whole class at once)? | P1-1 grade release UI |
| D5 | **Kelas naming convention** — what are the valid class identifiers for this pesantren? (e.g., `X-A`, `XI-A`, etc.) | P0-4 `hari` and `kelas` constraint |
| D6 | **Email verification and SMTP** — is there any scenario where institutional email (SMTP) will be enabled? Affects whether `email_verified_at` and verification routes should be fully purged or kept dormant. | Low priority; does not block P1 |

---

## 10. Summary of Key Design Constraints

- **RECOMMENDATION:** All new academic domain tables must include `academic_period_id FK→academic_periods` to enforce temporal scoping. No exceptions.
- **RECOMMENDATION:** The `kelas` string column must be constrained (PHP enum + validation) before P1-1 Santri portal work begins. The authorization boundary currently depends on string equality, and a typo is an authorization gap.
- **RECOMMENDATION:** The `penilaians.is_published` column must exist before the Santri gradebook is implemented.
- **RECOMMENDATION:** The teaching scope (which subjects an Ustadz sees in Penilaian/Materi) must be filtered by `academic_period_id` before multi-period data enters the system.
- **FACT:** All of the above are schema changes within the active development migration policy. `migrate:fresh --seed` is permitted.
- **RECOMMENDATION:** Do not introduce a formal `classes` table, `enrollments` table, or `questions` table before the problem they solve is demonstrably present. The sequence above defers them to the appropriate phase.


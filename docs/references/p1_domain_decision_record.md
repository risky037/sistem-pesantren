# P1 Domain Foundation Decision Record

**Date:** 2026-09-13
**Status:** APPROVED FOR IMPLEMENTATION
**Input Document:** `docs/references/p1_domain_architecture.md`
**Scope:** Design decisions only. Zero code or migrations produced by this document.
**Migration Policy:** Active development phase — direct migration edits and `migrate:fresh --seed` are permitted.

---

## Notation

- **[APPROVED]** — Final decision. Implementation may proceed.
- **[REJECTED]** — Alternative explicitly ruled out. Do not implement.
- **[DEFERRED]** — Not needed before LMS milestone. Revisit when triggered.
- **[OPEN]** — Requires stakeholder input before implementation. Engineering is blocked on this item.

---

## Decision 1: Academic Period

### Context

No temporal boundary exists in the current schema. All academic records (`jadwals`, `materis`, `penilaians`) accumulate without a year or semester partition. The `penilaians` unique key `(santri_id, subject_id, user_id)` has no time dimension — re-entering grades in a new semester overwrites the prior year's data.

### Decision

**[APPROVED]** Introduce an `academic_periods` table as the single temporal anchor for all academic domain records.

```sql
academic_periods
  id
  tahun_ajaran     varchar(9)    NOT NULL   -- e.g. '2025/2026'
  semester         varchar(10)   NOT NULL   -- 'Ganjil' or 'Genap'
  is_active        boolean       NOT NULL   DEFAULT false
  started_at       date          nullable
  ended_at         date          nullable
  created_at, updated_at

  UNIQUE (tahun_ajaran, semester)
  -- Application layer: at most one row has is_active = true
```

### Approved Mechanics

- `is_active` is the single "current period" signal. At most one row is `true` at any time.
- Activation is Admin-triggered (explicit action), not automatic date-range computation.
- `started_at` / `ended_at` are reference fields only — not used in query predicates.
- A helper method `AcademicPeriod::active(): ?AcademicPeriod` (Eloquent scope or static method) is the canonical way to retrieve the active period across controllers.
- Uniqueness constraint `(tahun_ajaran, semester)` prevents duplicate period records.

### Rejected Alternative: Date-Range Active Period

**[REJECTED]** Computing the active period via `WHERE NOW() BETWEEN started_at AND ended_at`.

*Rationale:* Adds query complexity. Overlap validation requires application-level checks or triggers. An institutional Admin explicitly controlling when a new semester "opens" is more operationally transparent. The boolean approach directly matches how a pesantren operates — a human opens the new term.

### Downstream Impact

Every academic table gains `academic_period_id NOT NULL FK → academic_periods ON DELETE RESTRICT`. The seeder must create and reference a default active period. Controllers that derive "current scope" must filter by `AcademicPeriod::active()->id`.

---

## Decision 2: Class / Kelas Modeling

### Context

`kelas` appears as a free-form string in three tables (`santris.kelas`, `jadwals.kelas`, `materis.kelas`). The authorization boundary in `StorePenilaianRequest` and `MateriPolicy` depends on string equality between these columns. No structural constraint prevents typos. Two alternatives were evaluated:

**Option A — Direct `santri.class_id`:** Add a `classes` table (with id, nama_kelas, tingkat). Replace `kelas` string columns with FK references to `classes`. Santri has `class_id NOT NULL FK → classes`. Jadwal and Materi also reference `class_id`.

**Option B — Constrained String (current approach hardened):** Keep the `kelas` string column. Constrain valid values via a PHP-backed enum and Form Request validation. No new database table.

**Option C — Enrollment Entity:** A separate `enrollments` table records which Santri is in which class for which academic period. `santris.kelas` is removed or demoted to a display field. Jadwal and Materi reference a `class_id` or a `kelas` string from the enrollment.

### Decision on Class Representation

**[APPROVED]** Constrained string (hardened Option B) for Phase P0-4/P1-1.

**[REJECTED]** Dedicated `classes` table (Option A) for Phase P1.

**[REJECTED]** Enrollment entity (Option C) for Phase P1.

### Rationale

The root problem is not that `kelas` is a string — it is that the string has no constraints. The authorization boundary fails because any string can be stored. A PHP-backed enum enforced at the Form Request layer closes this gap with a single migration (`CHECK` constraint or enum type) and a validation rule addition. No new entity is needed.

A dedicated `classes` table solves a different problem: relational integrity over a catalog of classes. This is only valuable if:
1. The Admin must manage the class catalog (create/rename/deactivate classes).
2. Queries need to group or aggregate by class independently of schedules.

Neither condition is demonstrated for P1-1. The class list at a pesantren is stable (e.g., `X-A`, `X-B`, `XI-A`, `XI-B`, `XII-A`, `XII-B`) and rarely changes. Encoding this in a PHP enum is correct and sufficient.

An enrollment entity (Option C) is the right model for tracking *which class a Santri was in per period* (for historical cohort reporting). This is a P2 concern. For P1, Santri's current class is a single field on the `santris` record, and `academic_period_id` on `penilaians` provides the temporal context for grade history.

### Approved `kelas` Implementation

**[APPROVED]** Define a PHP-backed enum `App\Enums\KelasName` with all valid class identifiers for this institution. The exact values are an **[OPEN]** stakeholder decision (see Decision Record Open Item #1 below). This enum is used in:
- `StoreSantriRequest` and `UpdateSantriRequest` validation for `santris.kelas`
- `StoreJadwalRequest` and `UpdateJadwalRequest` validation for `jadwals.kelas`
- `StoreMateriRequest` validation for `materis.kelas`

A database `CHECK` constraint may be added as defense-in-depth but is not required for correctness if application-layer validation is enforced at every write path.

### Class Membership per Period

**[APPROVED]** `santris.kelas` holds the Santri's **current** class. When a student advances to the next grade, the Admin updates `santris.kelas`. Prior-period grades in `penilaians` retain their `academic_period_id`, providing the temporal context. The question "what class was Santri X in during period Y?" is answered by the grade record's period, not by a historical enrollment entry.

**[DEFERRED]** A formal `enrollments` table (which Santri, which class, which period) is deferred to P2. It becomes necessary only when cohort reporting, batch promotion workflows, or historical class-membership queries are required.

---

## Decision 3: Subject Teaching Scope

### Context

An Ustadz's teaching scope (which subjects they may grade, which materials they may publish) is currently derived implicitly from `jadwals` rows. There is no explicit `teaching_assignments` or `ustadz_subjects` entity. Two alternatives were evaluated:

**Option A — Jadwal as Implicit Teaching Assignment (current):** Teaching scope is `Jadwal::where('user_id', $userId)->pluck('subject_id')->unique()`. The schedule IS the assignment.

**Option B — Explicit `subject_assignments` Entity:** A separate `subject_assignments` table records which Ustadz is assigned to which Subject for which Class in which Academic Period, independently of the schedule.

### Decision

**[APPROVED]** Jadwal as implicit teaching assignment. The `jadwals` table remains the single source of teaching scope derivation.

**[REJECTED]** Separate `subject_assignments` entity for Phase P1.

### Rationale

At a pesantren, a teaching assignment and a schedule slot are the same thing. If an Ustadz is assigned to teach Fiqih to class XII-A, there is a `jadwals` row encoding that. There is no institutional scenario in the PRD where an Ustadz is "assigned" to a subject without a corresponding schedule. A separate entity would duplicate the relationship already expressed by `jadwals.user_id + jadwals.subject_id + jadwals.kelas`.

The `subject_assignments` entity would add value if:
1. An Ustadz can be assigned to grade a subject without appearing in the schedule (e.g., for a co-teacher or evaluator role).
2. The schedule and the grading permission have different lifecycles.

Neither condition is present in the current PRD. The complexity cost of the separate entity is not justified.

### Required Constraint: Period-Scoped Teaching Scope

**[APPROVED]** All teaching scope queries must be filtered by active academic period once `academic_period_id` is on `jadwals`. This is the only modification required to the existing implicit model.

```php
// BEFORE (unbounded — returns subjects from all historical periods):
Jadwal::where('user_id', $userId)->pluck('subject_id')->unique();

// AFTER (period-scoped — correct):
Jadwal::where('user_id', $userId)
    ->where('academic_period_id', AcademicPeriod::active()->id)
    ->pluck('subject_id')
    ->unique();
```

**[APPROVED]** Add a composite unique constraint to `jadwals`:
```
UNIQUE (user_id, subject_id, kelas, hari, jam_mulai, academic_period_id)
```
This prevents duplicate schedule entries within the same period while allowing the same slot to exist in different periods.

### When to Revisit

The `subject_assignments` entity should be reconsidered when:
- A co-grader or evaluator role emerges (multiple Ustadz grade the same subject for the same class).
- Grading permission needs to be granted independently of the teaching schedule.
- Report requirements need to answer "who was responsible for this subject in this period" without joining through `jadwals`.

None of these conditions exist in the P1 PRD.

---

## Decision 4: Migration Implementation Order

### Principles

1. Each step must be independently committable and testable.
2. `migrate:fresh --seed` is used after each migration group.
3. No step modifies application code beyond what is necessary to keep the seeder and tests green.
4. Steps are ordered by dependency (a table that is referenced must exist before the FK is added).

### Sequence

```
LAYER 0 — IMMEDIATE (Critical pre-P1 blockers, no migration required)
──────────────────────────────────────────────────────────────────────
  0a. Create Santri/Dashboard.jsx stub
      ↳ Unblocks all Santri login. No DB change.
      ↳ Blocker: every provisioned Santri account currently causes a 500.

  0b. Resolve santris.email semantics (stakeholder input required)
      ↳ Once resolved: rename column or remove it.
      ↳ Update StoreSantriRequest, UpdateSantriRequest, SantriFactory, seeder.


LAYER 1 — academic_periods + hari constraint (P0-4)
──────────────────────────────────────────────────────────────────────
  1a. Create academic_periods table migration
      ↳ No FK changes to other tables yet.
      ↳ Seed: insert one active period ('2025/2026', 'Ganjil', is_active: true).
      ↳ Add AcademicPeriod model + active() scope.

  1b. Constrain jadwals.hari
      ↳ Define HariEnum: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu.
      ↳ Add validation in StoreJadwalRequest and UpdateJadwalRequest.
      ↳ (Optional) Add DB CHECK constraint if MySQL version supports it cleanly.

  1c. Constrain kelas string (requires stakeholder sign-off on valid values)
      ↳ Define KelasName enum with institution-approved values.
      ↳ Apply in StoreSantriRequest, UpdateSantriRequest,
        StoreJadwalRequest, UpdateJadwalRequest, StoreMateriRequest.


LAYER 2 — academic_period_id on jadwals (P0-4)
──────────────────────────────────────────────────────────────────────
  2a. Add academic_period_id FK to jadwals (NOT NULL)
      ↳ Edit create_jadwals_table migration.
      ↳ FK: ON DELETE RESTRICT.
      ↳ Add composite unique: (user_id, subject_id, kelas, hari, jam_mulai, academic_period_id).
      ↳ Seeder: assign all seeded jadwals to the default active period.
      ↳ Update StoreJadwalRequest to include academic_period_id (or resolve from
        AcademicPeriod::active() automatically — do not expose to form input).
      ↳ Update PenilaianController and MateriController teaching scope queries
        to filter by active period.


LAYER 3 — academic_period_id on penilaians (P0-4)
──────────────────────────────────────────────────────────────────────
  3a. Add academic_period_id FK to penilaians (NOT NULL)
      ↳ Edit create_penilaians_table migration.
      ↳ FK: ON DELETE RESTRICT.
      ↳ DROP old unique key (santri_id, subject_id, user_id).
      ↳ ADD new unique key (santri_id, subject_id, user_id, academic_period_id).
      ↳ Seeder: assign all seeded penilaians to the default active period.
      ↳ Update StorePenilaianRequest to resolve period from AcademicPeriod::active().


LAYER 4 — academic_period_id on materis (P0-4)
──────────────────────────────────────────────────────────────────────
  4a. Add academic_period_id FK to materis (nullable initially)
      ↳ Edit create_materis_table migration.
      ↳ nullable() FK: ON DELETE SET NULL.
      ↳ Rationale: materials are less tightly bound to a period than grades or schedules.
        A published document (e.g. a reference syllabus) may intentionally span periods.
        Setting to nullable prevents seeder complexity and allows legacy records to survive.
      ↳ Seeder: optionally assign seeded materis to the default active period.
      ↳ MateriController: when creating, default to AcademicPeriod::active()->id if available.
      ↳ Santri portal materi filter: WHERE academic_period_id = active OR academic_period_id IS NULL
        (shows current + perennial materials).


LAYER 5 — P1-1 Santri Portal Foundations
──────────────────────────────────────────────────────────────────────
  5a. Add is_published boolean to penilaians (default false)
      ↳ Edit create_penilaians_table migration.
      ↳ Santri gradebook query: WHERE is_published = true.
      ↳ Ustadz: new "Release Grades" action per subject/kelas/period.

  5b. Santri portal routes, controllers, and views
      ↳ Schedule viewer: Jadwal WHERE santris.kelas = jadwals.kelas
                                  AND academic_period_id = active.
      ↳ Materi browser:  Materi WHERE kelas = santri.kelas
                                  AND (academic_period_id = active OR period IS NULL).
      ↳ Grade view:      Penilaian WHERE santri_id = santri.id
                                   AND is_published = true.


LAYER 6 — P1-2+ LMS Assignment Domain (Deferred)
──────────────────────────────────────────────────────────────────────
  6a. assignments table (depends on Layers 1–4 complete)
  6b. submissions table (depends on assignments)
  6c. Question bank (P1-3, separate design task)
```

### Migration Layer Dependencies

```
academic_periods (Layer 1a)
       │
       ├──► jadwals.academic_period_id (Layer 2a)
       │         │
       │         └──► PenilaianController scope fix
       │
       ├──► penilaians.academic_period_id (Layer 3a)
       │         │
       │         └──► Unique key change
       │
       ├──► materis.academic_period_id (Layer 4a)
       │
       └──► is_published on penilaians (Layer 5a)
                 │
                 └──► Santri gradebook (Layer 5b)
```

---

## Decision 5: Scope Control — Must vs. Deferred

### Must Implement Before LMS (P1-1 Gate)

These items are prerequisites. LMS feature work must not begin until each is resolved.

| # | Item | Why It Is a Gate |
|---|------|-----------------|
| G1 | **Santri/Dashboard.jsx stub** | Santri login is currently broken (500 error). Any Santri account provision will immediately surface this. |
| G2 | **`santris.email` resolution** | The Santri create form and profile page are ambiguous without knowing whether this column is login email, guardian email, or redundant. |
| G3 | **`academic_periods` table (Layer 1a)** | All subsequent layers depend on this. Teaching scope, grade uniqueness, and material scoping are incorrect without it. |
| G4 | **`jadwals.academic_period_id` + scope query fixes (Layer 2a)** | Teaching scope queries return stale data from prior periods. PenilaianController and MateriController authorization depend on Jadwal-derived scope. |
| G5 | **`penilaians.academic_period_id` + unique key update (Layer 3a)** | Without this, re-entering grades in a new semester silently overwrites prior-year data. This is an active data integrity risk. |
| G6 | **`kelas` string constraint (Layer 1c)** | The authorization boundary in `StorePenilaianRequest` and `MateriPolicy` relies on string equality. An unconstrained string is an authorization gap. |
| G7 | **`penilaians.is_published` (Layer 5a)** | Required before any Santri can see grades. Without it, Santri sees all in-progress grade entries. |

### Can Defer (Post-P1-1)

| # | Item | Trigger for Activation |
|---|------|----------------------|
| D1 | `materis.academic_period_id` (Layer 4a) | Needed before Santri material browser shows period-scoped content. Can ship P1-1 portal without it (show all materis for Santri's kelas). Activate in P1-1 sprint 2. |
| D2 | Jadwal composite unique constraint | Prevents data entry errors but not a security gap. Low priority for small user base. Activate with Layer 2a. |
| D3 | `CHECK` constraint on `kelas` at DB level | Application-layer enum validation (G6) is sufficient. DB constraint is defense-in-depth. Defer unless data entry bugs occur. |
| D4 | `HariEnum` DB constraint | Application-layer enum validation is sufficient. |
| D5 | Formal `classes` table | Not needed until the Admin requires a managed class catalog or cohort reporting. |
| D6 | Enrollment history (`enrollments` table) | Not needed until "what class was this Santri in during period Y" becomes a query requirement. P2. |
| D7 | `subject_assignments` entity | Not needed until co-grader or cross-Ustadz grading permission is required. |
| D8 | Grading formula / KKM configuration | PRD Q4 open. Keep `nilai_akhir` as a simple average until policy is finalized. |
| D9 | Admin academic oversight UI (Materi/Penilaian views for Admin) | Currently no Admin routes for these. PRD mentions aggregate progress review. Design separately. |
| D10 | `must_change_password` flag | Mentioned in credential lifecycle ADR as a future UX improvement for credential handoff. Not a P1 dependency. |

---

## Rejected Alternatives Summary

| Alternative | Rejected In | Reason |
|-------------|-------------|--------|
| Date-range active period computation | Decision 1 | Adds query complexity without operational benefit for institutional context |
| Dedicated `classes` table (P1) | Decision 2 | Premature. Class catalog at pesantren is stable; enum constraint solves the actual problem (typo risk) without a new entity |
| `enrollments` table (P1) | Decision 2 | Needed for historical cohort reporting, not for P1 Santri portal. `academic_period_id` on `penilaians` provides sufficient temporal context |
| `subject_assignments` entity (P1) | Decision 3 | Teaching scope fully expressed by `jadwals`. No scenario in PRD where grading permission differs from schedule assignment |
| `materis.academic_period_id` NOT NULL (Layer 4) | Decision 4 | Materials may legitimately be perennial (no time bound). Nullable FK + portal filter handles both cases without forcing seeder complexity |

---

## Open Items — Stakeholder Resolution Required

> [!IMPORTANT]
> The following items cannot be resolved by engineering. Implementation of the indicated layers is blocked until each is answered.

| # | Question | Blocks | Owner |
|---|----------|--------|-------|
| O1 | **`santris.email` semantics:** Is this the guardian/wali contact email (rename → `email_wali`) or a duplicate of `users.email` (remove)? | Layer 0b, Santri create form, P1-1 Santri profile | Stakeholder |
| O2 | **Valid `kelas` values:** What are the exact class identifiers used by this pesantren? (e.g., `X-A`, `XI-B`, etc.) | Layer 1c (`KelasName` enum definition) | Stakeholder |
| O3 | **Semester activation process:** When a new semester begins, does the Admin click "activate new period" in the UI? Or is there a batch student-advancement workflow (all `aktif` Santri advance to next `kelas`)? | Layer 1a Admin UI design | Stakeholder |
| O4 | **Grade release granularity:** Does Ustadz release grades per individual Santri, per subject-class pair, or per entire class for all subjects? (Affects the grade release UI action scope) | Layer 5a `is_published` UI | Stakeholder |
| O5 | **KKM and grading formula:** What is the weighting for Tugas/UTS/UAS? Is there a minimum passing score per subject? | Santri gradebook display (P1-5) | Stakeholder |

---

## Risks

| Risk | Severity | Status | Mitigation |
|------|----------|--------|------------|
| **`penilaians` unique key collision across years** — re-entering grades overwrites prior year | HIGH | **Active** — no period data entered yet, but first semester transition will trigger this | G5 (Layer 3a) must ship before second semester |
| **Kelas string typo breaks authorization** | HIGH | **Active** | G6 (Layer 1c) must ship before P1-1 Santri portal |
| **Santri login broken (500)** | CRITICAL | **Active** | G1 must ship immediately |
| **Teaching scope unbounded across periods** | MEDIUM | **Latent** — will surface at first period transition | G4 (Layer 2a) |
| **Grade visibility without publish control** | MEDIUM | **Latent** — will surface when Santri portal is built | G7 (Layer 5a) |
| **`santris.email` surfaces ambiguity in Santri profile UI** | MEDIUM | **Latent** | O1 resolution + Layer 0b |
| **No duplicate Jadwal constraint** | LOW | Latent — Admin UX risk, not a security gap | D2 (deferred, activate with Layer 2a) |
| **Grading formula undefined** | LOW | Deferred by design | O5; keep simple average until policy decided |
| **Enrollment history unavailable** | LOW | Deferred by design | D6; P2 concern |

---

## Final Schema Diagram (Approved Target for P1-1)

```
academic_periods
  id, tahun_ajaran, semester, is_active, started_at, ended_at

users
  id, name, email, password, role (UserRole enum), is_active

santris
  id, user_id (UNIQUE FK → users RESTRICT),
  nis (unique), nama, jenis_kelamin, tanggal_lahir, alamat,
  kelas (constrained string — KelasName enum),
  program, status, [email_wali|removed — pending O1], telepon

subjects
  id, kode_mapel (unique), nama_mapel, deskripsi

jadwals
  id, user_id (FK → users RESTRICT),
      subject_id (FK → subjects RESTRICT),
      academic_period_id (FK → academic_periods RESTRICT),
  hari (constrained — HariEnum),
  jam_mulai, jam_selesai,
  kelas (constrained — KelasName enum),
  ruang
  UNIQUE (user_id, subject_id, kelas, hari, jam_mulai, academic_period_id)

materis
  id, user_id (FK → users RESTRICT),
      subject_id (FK → subjects RESTRICT),
      academic_period_id (FK → academic_periods SET NULL, nullable),
  judul, deskripsi, kelas (nullable, KelasName enum),
  file_path, original_file_name, published_at

penilaians
  id, user_id (FK → users RESTRICT),
      santri_id (FK → santris RESTRICT),
      subject_id (FK → subjects RESTRICT),
      academic_period_id (FK → academic_periods RESTRICT),
  tugas, uts, uas, nilai_akhir, catatan,
  is_published (boolean default false)
  UNIQUE (santri_id, subject_id, user_id, academic_period_id)
```

---

## Summary of Decisions

| Decision | Outcome |
|----------|---------|
| Academic period model | **`academic_periods` table with `is_active` boolean** — approved |
| Active period computation | **Admin-explicit boolean activation** — date-range rejected |
| Class representation | **Constrained PHP enum string** — dedicated `classes` table rejected for P1 |
| Enrollment history | **Deferred to P2** — `academic_period_id` on penilaians provides sufficient temporal context for P1 |
| Teaching scope | **Jadwal as implicit assignment** — `subject_assignments` entity rejected for P1 |
| Period filter for teaching scope | **Filter all scope queries by `AcademicPeriod::active()`** — approved |
| `penilaians` unique key | **Expand to include `academic_period_id`** — approved |
| Grade release control | **`is_published` boolean on `penilaians`** — approved |
| `materis.academic_period_id` | **Nullable FK, SET NULL** — perennial materials supported |
| `jadwals` composite unique | **Added with `academic_period_id`** — approved |

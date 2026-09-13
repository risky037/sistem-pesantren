# P1 Academic Period Architecture Review

## 1. Schema Design Analysis

### Table Structure
The core architectural shift is the introduction of an `academic_periods` table to provide a temporal anchor for all academic data. 
- **Columns**: `id`, `tahun_ajaran` (varchar, e.g., '2025/2026'), `semester` (varchar, e.g., 'Ganjil', 'Genap'), `is_active` (boolean), `started_at` (date, nullable), `ended_at` (date, nullable), `timestamps`.
- **Indexes**: `UNIQUE (tahun_ajaran, semester)`.
- **Active Period Strategy**: The `is_active` boolean serves as the single source of truth for the current term. 
  - **Explicit Rule**: Activation/deactivation of academic periods must happen inside a database transaction to prevent race conditions.
  - **Explicit Rule**: Only one active period is allowed at any given time, enforced by the application service.

### Domain Modeling
- **Class / Kelas Representation**: Use `config/pesantren.php` controlled string validation for class representation (`kelas`). Do not introduce a database table or "Kelas enum". Form Requests must validate against this configuration.

## 2. Migration Strategy
Since this project is in the Active Development Phase, direct editing of migration files and running `php artisan migrate:fresh --seed` is explicitly allowed and preferred.

- **Existing Data Compatibility**: Since we will run `migrate:fresh --seed`, legacy unstructured data will be dropped and recreated via Seeders to reflect the new period constraints.
- **Foreign Key Additions**:
  - `jadwals`: Add `academic_period_id` (NOT NULL, `ON DELETE RESTRICT`).
  - `penilaians`: Add `academic_period_id` (NOT NULL, `ON DELETE RESTRICT`).
  - `materis`: Add `academic_period_id` (NOT NULL, `ON DELETE RESTRICT`). *Reason: The current materi table represents period-specific teaching material, not a reusable curriculum library. The reusable curriculum library feature is deferred.*
- **Unique Key Modifications**:
  - `penilaians`: Replace `(santri_id, subject_id, user_id)` with `(santri_id, subject_id, user_id, academic_period_id)` to prevent collisions when re-entering grades in a new term.
  - `jadwals`: Add `(user_id, subject_id, kelas, hari, jam_mulai, academic_period_id)`.

## 3. Authorization Impact
Explicit authorization rules are required to ensure historical data integrity:
- **Ustadz**: Permitted to perform CRUD operations *only* for the currently active academic period. They cannot edit, delete, or add records to historical periods.
- **Admin**: Permitted to manage historical periods (e.g., viewing and correcting past records if necessary).
- **Ownership Rules**: Existing horizontal ownership in `MateriPolicy` and `PenilaianPolicy` (e.g. Ustadz can only modify their own data) must be preserved and further guarded by the active academic period constraint.

## 4. Controller Impact
- **Admin Controllers**: Add CRUD endpoints for `AcademicPeriod`, including a dedicated "Set Active" action to manage the `is_active` flag atomically within a database transaction.
- **Ustadz Controllers (`JadwalController`, `MateriController`, `PenilaianController`)**: Queries determining teaching scope (e.g., `Jadwal::where(...)`) must include `->where('academic_period_id', AcademicPeriod::active()->id)`.
- **Form Requests**: 
  - Submissions must inherently link to the active period instead of exposing `academic_period_id` in the UI to prevent injection.
  - `StorePenilaianRequest` must validate authorization against the active period schedule.
- **Policies**: Extend `before()` or core rules to enforce Ustadz constraints on editing historical period resources.

## 5. Model Additions
- **AcademicPeriod Model**: Must include an `active()` scope to easily fetch or filter by the active period across the application.

## 6. Testing Strategy
- **Regression Tests**: Verify that Ustadz can still perform core CRUD on materials and grades for the *active* period.
- **Historical Data Tests**: Assert that attempts by Ustadz to edit or submit grades/materis for a *past* `academic_period_id` yield HTTP 403.
- **Authorization Tests**: Assert that `AcademicPeriod::active()` is respected and Ustadz cannot maliciously inject a past/future `academic_period_id` during a POST request.

## 7. Decisions
- **[APPROVED]** Introduce `academic_periods` table with an `is_active` boolean as the temporal anchor.
- **[APPROVED]** Activation/deactivation of periods must occur in a database transaction, managed by an application service ensuring only one active period.
- **[APPROVED]** Add an `active()` scope to the `AcademicPeriod` model.
- **[APPROVED]** Constrain `jadwals` teaching scopes globally by `AcademicPeriod::active()->id`.
- **[APPROVED]** Expand `penilaians` unique constraint to include `academic_period_id`.
- **[APPROVED]** Materis will have a NOT NULL `academic_period_id`.
- **[APPROVED]** Use `config/pesantren.php` for `kelas` string validation.

## 8. Rejected Alternatives
- **[REJECTED] Date-range based active period:** Computing active period via `WHERE NOW() BETWEEN started_at AND ended_at` adds query complexity and overlap validation issues. Admin-controlled boolean is preferred.
- **[REJECTED] Separate `subject_assignments` table:** Teaching scope remains implicitly defined by the `jadwals` schedule. A new table is unnecessary complexity at this stage.
- **[REJECTED] Dedicated `classes` table or Kelas Enum:** `kelas` will remain a constrained string controlled by `config/pesantren.php`, as creating a separate table or enum does not serve an immediate operational need and adds unneeded complexity.
- **[REJECTED] Nullable `academic_period_id` for Materis:** Reusable curriculum library is deferred; current materis are strictly tied to specific teaching periods.

## 9. Migration & Seeding Order
1. `create_academic_periods_table` with constraints.
2. Update `create_jadwals_table` to add `academic_period_id` (NOT NULL) and composite unique key.
3. Update `create_penilaians_table` to add `academic_period_id` (NOT NULL) and replace the unique key.
4. Update `create_materis_table` to add `academic_period_id` (NOT NULL).
5. **Seeding Strategy**: The default active period **must** be created first before any dependent seed data (`jadwals`, `penilaians`, `materis`) is inserted.
6. Execute `php artisan migrate:fresh --seed`.

## 10. Implementation Phases
1. **Model & Migration Update (Data Layer)**: Create the AcademicPeriod model with `active()` scope, update existing migrations, run `migrate:fresh --seed`. Ensure seeder order is strictly followed.
2. **Controller & Authorization Integration**: Update Ustadz teaching scope queries, Form Requests, and Policies to strictly enforce the active period constraint and Ustadz vs Admin authorization boundaries.
3. **Admin Period Management**: Build the Admin UI/Controller to manage periods and toggle the `is_active` status securely within DB transactions.
4. **Testing & Verification**: Write regression, historical, and authorization tests.

## 11. Risks
- **Data Loss on `migrate:fresh`**: Acceptable and expected in the active development phase, but Seeders must be rigorously updated to provide complete dev data.
- **Latent Authorization Gaps**: If any Ustadz query omits the `academic_period_id` filter, it may expose or corrupt historical grades.
- **UI State Confusion**: Failing to clearly display the currently active Academic Period in the Ustadz/Admin dashboard may cause data-entry confusion.

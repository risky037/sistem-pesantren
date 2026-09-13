# P1-1 Implementation Plan: Academic Period Integration

## 1. Migration Sequence
*Active development phase rules apply: Edit existing migrations directly and run `migrate:fresh --seed`.*

1. **`create_academic_periods_table`**:
   - `id`, `tahun_ajaran` (string), `semester` (string), `is_active` (boolean default false), `started_at` (date nullable), `ended_at` (date nullable), timestamps.
   - `UNIQUE (tahun_ajaran, semester)`.
2. **`create_jadwals_table`**:
   - Add `academic_period_id` (foreign key, NOT NULL, `constrained()->onDelete('restrict')`).
   - Add composite unique key: `UNIQUE (user_id, subject_id, kelas, hari, jam_mulai, academic_period_id)`.
3. **`create_penilaians_table`**:
   - Add `academic_period_id` (foreign key, NOT NULL, `constrained()->onDelete('restrict')`).
   - Replace unique key `(santri_id, subject_id, user_id)` with `(santri_id, subject_id, user_id, academic_period_id)`.
4. **`create_materis_table`**:
   - Add `academic_period_id` (foreign key, NOT NULL, `constrained()->onDelete('restrict')`).

## 2. Model Creation & Changes
1. **`AcademicPeriod` Model**:
   - Fillable: `tahun_ajaran`, `semester`, `is_active`, `started_at`, `ended_at`.
   - Casts: `is_active => 'boolean'`, `started_at => 'date'`, `ended_at => 'date'`.
   - Local Scope `scopeActive($query)`: To retrieve the single active period. *Explicit Constraint: Do NOT use a global scope to prevent accidental masking of historical records for Admins.*
   - Static Method: `public static function requireActive(): self` - returns the active period or fails explicitly (e.g., throwing a domain exception) if no active period exists.
2. **`Jadwal`, `Penilaian`, `Materi` Models**:
   - Add `academic_period_id` to `$fillable`.
   - Add `academicPeriod()` `belongsTo` relationship.

## 3. Service/Action Design for Activating Period
Create an application service (e.g., `app/Services/AcademicPeriodService.php`) with the following logic:
- A method `setActivePeriod(AcademicPeriod $period)` that executes within a `DB::transaction()`.
- Inside the transaction:
  1. `AcademicPeriod::where('is_active', true)->update(['is_active' => false]);`
  2. `$period->update(['is_active' => true]);`
- This ensures that only one period is active at any given time.

## 4. Authorization Changes
*Explicit Constraint: Role-based temporal scoping and historical access preservation for Admin.*

- **`PenilaianPolicy` & `MateriPolicy`**:
  - For Ustadz actions (create, update, delete): Ensure the related resource's `academic_period_id` matches the *currently active* `academic_period_id`. If it does not, deny access (prevent editing historical grades or materials).
  - The existing `before()` method already grants `Admin` unrestricted access, preserving their ability to manage historical periods.

## 5. Controller Changes
- **Admin Period Management**:
  - `Admin\AcademicPeriodController` to handle CRUD of periods and a route/method for activating a period using the `AcademicPeriodService`.
- **Ustadz Controllers (`JadwalController`, `MateriController`, `PenilaianController`)**:
  - When fetching lists of records for an Ustadz, they must be explicitly filtered by the active period:
    ```php
    $activePeriod = AcademicPeriod::requireActive(); // Fails explicitly if absent
    $jadwals = Jadwal::where('user_id', auth()->id())
                     ->where('academic_period_id', $activePeriod->id)
                     ->get();
    ```
  - When creating new `Penilaian` or `Materi`, the controller/request must automatically assign the active period's ID.

## 6. FormRequest Changes
- Submissions by Ustadz (`StorePenilaianRequest`, `StoreMateriRequest`, `UpdatePenilaianRequest`, `UpdateMateriRequest`):
  - Do not expect or validate `academic_period_id` from the client.
  - The controller or `prepareForValidation` method should inject the `AcademicPeriod::requireActive()->id`.
  - Validate that the target resources (e.g., in `UpdatePenilaianRequest`) belong to the active period.
- Class validation (`kelas`): Replace unstructured strings with validation rules referencing `config('pesantren.kelas')` via the `in:` validation rule (e.g., `Rule::in(config('pesantren.kelas'))`).

## 7. UI Changes
- **Admin Layout**: Add a navigation link to manage Academic Periods.
- **Admin Academic Period Views**: Index (list of terms), Create, Edit, and a toggle/button to "Activate" a specific period (with SweetAlert confirmation).
- **Ustadz Dashboard/Layout**: Clearly display the currently active Academic Period name in the header or dashboard to avoid context confusion.
- **Form Views**: Ensure `kelas` dropdowns are populated dynamically from `config('pesantren.kelas')`.

## 8. Seeder Strategy
Order is critical:
1. **`AcademicPeriodSeeder`**: Must run first. Creates at least one default active period (e.g., '2025/2026', 'Ganjil', `is_active: true`) and optionally some historical ones.
2. **Dependent Seeders**:
   - `JadwalSeeder`, `PenilaianSeeder`, `MateriSeeder` must explicitly retrieve `AcademicPeriod::requireActive()->id` (or filter by `is_active`) and assign it to the seeded records.
3. Finally, execute `php artisan migrate:fresh --seed` to rebuild the database with consistent data.

## 9. Test Strategy
1. **Model & Service Tests**:
   - Verify the service successfully toggles the active period inside a transaction and maintains the invariant (max one active period).
   - Verify `AcademicPeriod::requireActive()` throws when none are active.
2. **Authorization & Scope Tests**:
   - Verify Ustadz receives 403 Forbidden when trying to update/delete a `Penilaian` or `Materi` from a past period.
   - Verify Ustadz index routes only return data belonging to the active period.
   - Verify Admin can still view/manage data from past periods.
3. **Data Integrity & Form Request Tests**:
   - Verify composite unique constraints (e.g., adding the same schedule for the same Ustadz, subject, kelas, day, time, and *period* fails).
   - Verify that invalid `kelas` strings fail validation based on the config values.

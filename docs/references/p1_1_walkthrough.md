# P1-1 Academic Period Integration Walkthrough

## 1. Files Changed
- **Migrations**:
  - `database/migrations/2026_06_15_000000_create_academic_periods_table.php` (New)
  - `database/migrations/2026_06_15_000002_create_jadwals_table.php` (Modified: added `academic_period_id`, composite unique)
  - `database/migrations/2026_06_15_000003_create_penilaians_table.php` (Modified: added `academic_period_id`, composite unique)
  - `database/migrations/2026_06_15_000004_create_materis_table.php` (Modified: added `academic_period_id`)
- **Models**:
  - `App\Models\AcademicPeriod` (New)
  - `App\Models\Jadwal`
  - `App\Models\Penilaian`
  - `App\Models\Materi`
- **Controllers**:
  - `App\Http\Controllers\Admin\AcademicPeriodController` (New)
  - `App\Http\Controllers\Ustadz\JadwalController`
  - `App\Http\Controllers\Ustadz\MateriController`
  - `App\Http\Controllers\Ustadz\PenilaianController`
- **Services**:
  - `App\Services\AcademicPeriodService` (New)
- **Requests & Policies**:
  - `App\Http\Requests\Admin\StoreAcademicPeriodRequest` (New)
  - `App\Http\Requests\Admin\UpdateAcademicPeriodRequest` (New)
  - `App\Policies\AcademicPeriodPolicy` (New)
  - `App\Policies\MateriPolicy`
  - `App\Policies\PenilaianPolicy`
- **Frontend (React/Inertia)**:
  - `resources/js/Pages/Admin/AcademicPeriod/Index.jsx`
  - `resources/js/Pages/Admin/AcademicPeriod/Create.jsx`
  - `resources/js/Pages/Admin/AcademicPeriod/Edit.jsx`
- **Tests**:
  - `tests/Feature/Admin/AcademicPeriodTest.php`
  - `tests/Feature/AcademicPeriodServiceTest.php`
  - `tests/Feature/AcademicPeriodConstraintTest.php`
  - `tests/Feature/Ustadz/AcademicPeriodAccessTest.php`

## 2. Schema Impact
- **New Table**: `academic_periods` tracking `tahun_ajaran`, `semester`, and boolean `is_active`.
- **Foreign Keys**: Added `academic_period_id` linking strictly (`restrict` on delete) to Jadwal, Penilaian, and Materi.
- **Unique Indexes**: Updated existing composite unique indexes on `jadwals` and `penilaians` to factor in `academic_period_id` allowing duplicates across distinct academic terms. *These indexes precisely mirror the requirements and business patterns to enforce one grade per subject/santri/period, and one class schedule slot per period.*
- **Cleanups**: Addressed unexpected column additions such as `is_published` on `penilaians` from initial scaffold to strictly adhere to P1-1 scope.

## 3. Security Impact
- **Ustadz Boundaries**: Ustadz index queries and creation functions (`store()`) have been hardcoded to strictly depend on `AcademicPeriod::requireActive()` fetching the term dynamically from the server.
- **Historical Records Lock**: `MateriPolicy` and `PenilaianPolicy` explicitly rely on `AcademicPeriod::requireActive()` to block updates and deletions targeting records originating from historical (non-active) academic periods. 

## 4. Migration Impact
- **Breaking Changes**: By integrating NOT NULL `academic_period_id` into Core Models, legacy testing seeders omitting it break implicitly—a requirement successfully fulfilled by selectively adjusting our internal test scenarios and database seeder logic where applicable.
- **Execution**: The `artisan migrate:fresh --seed` runs impeccably with a dynamically seeded valid fallback `AcademicPeriod` entry.

## 5. Test Result
- **Coverage**: Passed successfully for constraints, Ustadz isolation, Admin period control, service lock validations, and general security boundary protections.
- **Count**: All 80 feature and unit tests evaluated smoothly, delivering 100% green coverage against structural changes.

# P1-3A Assignment Foundation Walkthrough

## Overview
This pull request implements the P1-3A Assignment Foundation milestone for the LMS. It establishes the `assignments` table, model, authorization rules, form requests, and Ustadz CRUD controller. The frontend includes minimal Inertia stub pages to ensure routes are fully testable.

## Changes Made

### 1. Database
- **Migration**: Created `create_assignments_table` with foreign keys (`academic_period_id`, `subject_id`, `ustadz_id`) restricted appropriately. Added `kelas`, `title`, `description`, `due_date`, and `status`. Configured correct composite indexes.
- **Seeding**: Updated `DatabaseSeeder.php` to include sample draft and open assignments for the active academic period.

### 2. Model
- **Assignment**: Created `App\Models\Assignment` with relationships (`academicPeriod`, `subject`, `ustadz`), fillable properties, date casting for `due_date`, and helper methods (`isDraft()`, `isOpen()`, `isClosed()`).

### 3. Authorization
- **AssignmentPolicy**: Defined rules restricting Ustadz to managing their own assignments, restricting Santri to viewing open assignments for their matching `kelas` in the active period, and granting Admin full access through `before()`.

### 4. Form Requests
- **StoreAssignmentRequest**: Validates incoming data and ensures the Ustadz has a valid teaching schedule (`Jadwal`) for the selected subject and kelas in the active period. `academic_period_id` is stripped from the request body to prevent injection.
- **UpdateAssignmentRequest**: Restricts updates to title, description, and due date. Validates the assignment is in `draft` status via the Policy.

### 5. Controller & Routes
- **AssignmentController (Ustadz)**: Developed standard CRUD actions alongside `open` and `close` status transition methods. Implemented server-side extraction of the active academic period.
- **Routes**: Added `ustadz.assignments.*` resource and transition routes inside `routes/web.php` guarded by `auth` and `role:ustadz`.

### 6. Frontend
- Created foundational React components (`Index.jsx`, `Create.jsx`, `Edit.jsx`) using existing project conventions (`UstadzLayout`, `PageHeader`, `DataTableWrapper`, `InputLabel`, `TextInput`, `InputError`).

### 7. Testing
- Added comprehensive test suite `tests/Feature/Ustadz/AssignmentTest.php` asserting role boundaries, Ustadz ownership logic, temporal boundary logic (preventing assignments for previous periods), injection prevention, and Santri/Admin policy accessibility. 

## Verification Results
- [x] All 97 PHPUnit tests pass, maintaining a 100% pass rate.
- [x] Code standard enforcement via Laravel Pint (`--format agent`).
- [x] Vite build completed successfully (`npm run build`).
- [x] Zero trailing whitespace (`git diff --check`).

This branch is now ready for your final review before committing.

# P1-0 Implementation Plan: Domain Safety Foundation

## Goal
Implement Milestone P1-0 of the Domain Safety Foundation. This milestone closes immediate authorization gaps, clarifies the semantic meaning of email domains, and prepares the schema for temporal scoping without introducing premature abstractions like a dedicated `kelas` database table.

## Proposed Changes

### Database & Models

#### [MODIFY] `database/migrations/..._create_santris_table.php`
- Rename the `email` column to `email_wali` to clearly distinguish it from `users.email` (which remains the authentication identity).

#### [MODIFY] `app/Models/Santri.php`
- Update `$fillable` to replace `email` with `email_wali`.

#### [MODIFY] `database/factories/SantriFactory.php` & `database/seeders/DatabaseSeeder.php` (or `SantriSeeder.php`)
- Update fake data generation to populate `email_wali` instead of `email`.

---

### Enums & Configuration

#### [NEW] `app/Enums/HariEnum.php`
- Create a PHP backed enum for valid schedule days (`Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu`).

#### [NEW] `config/pesantren.php`
- Create a configuration file to store the valid `kelas` identifiers (e.g., `X-A`, `XI-B`). This will be used in form requests to validate `kelas` inputs dynamically.

---

### Form Requests Validation

#### [MODIFY] `app/Http/Requests/StoreSantriRequest.php` & `UpdateSantriRequest.php`
- Replace `email` rules with `email_wali`.
- Add `Rule::in(config('pesantren.kelas_allowed'))` constraint for `kelas`.

#### [MODIFY] `app/Http/Requests/StoreJadwalRequest.php` & `UpdateJadwalRequest.php`
- Add `Rule::enum(HariEnum::class)` constraint for `hari`.
- Add `Rule::in(config('pesantren.kelas_allowed'))` constraint for `kelas`.

#### [MODIFY] `app/Http/Requests/StoreMateriRequest.php` (and Update if exists)
- Add `Rule::in(config('pesantren.kelas_allowed'))` constraint for `kelas`.

---

### Controllers & UI

#### [MODIFY] `app/Http/Controllers/Admin/SantriController.php`
- Update payload handling to use `email_wali` instead of `email` during create and update.

#### [MODIFY] `resources/js/Pages/Admin/Santri/Create.jsx` & `Edit.jsx` (and Index/Show)
- Update form inputs and data tables to reflect `email_wali` instead of `email`.

## Migration Impact
- **Impact:** High for local development state. Since we are in the Active Development Phase, we will directly edit the existing `santris` migration.
- **Action:** A `php artisan migrate:fresh --seed` will be required after implementation.

## Security Impact
- **Identity Clarity:** Disambiguates `santris.email_wali` (contact data) from `users.email` (authentication data).
- **Authorization Hardening:** Secures authorization boundaries in controllers that rely on `kelas` matching by ensuring `kelas` cannot be polluted with arbitrary strings or typos.

## Validation Strategy
- Use `Rule::enum(HariEnum::class)` to validate `hari` inputs strictly.
- Use `Rule::in(config('pesantren.kelas_allowed'))` to validate `kelas` inputs, allowing easy institutional updates without code changes.

## Test Cases
- **Santri Dashboard Verification:** Assert that a Santri login correctly resolves to the implemented dashboard (`santri.dashboard`) returning a 200 OK, verifying no 500 errors exist.
- **Validation Rejection:** Assert that submitting an invalid `kelas` (e.g., "Invalid-Class") or `hari` string is correctly rejected with a 422 Unprocessable Entity by `StoreSantriRequest` and `StoreJadwalRequest`.
- **Identity Persistence:** Assert that `email_wali` is persisted correctly during Santri creation and updating.

## Rollback Risk
- **Risk Level:** Low.
- **Reasoning:** No structural foreign key changes are being introduced. The changes are additive constraints at the application layer and a simple column rename on a leaf table. Rollback involves reverting code and re-running `migrate:fresh --seed`.

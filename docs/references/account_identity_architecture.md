# Account & Identity Architecture Decision Report (Revised)

## A. Executive Decision

**[DECISION]** The `users` table is the single authentication identity for all actors (Admin, Ustadz, Santri). Ustadz academic data lives directly on `users` plus existing domain tables (`jadwals`, `materis`, `penilaians`); no separate Ustadz profile table. Santri academic records remain in `santris`, linked to authentication via a **required** `santris.user_id → users.id` (NOT NULL, UNIQUE, FK). Admin needs no profile table. The `role` string column is replaced by a PHP backed enum `UserRole` cast on the `User` model. All accounts are Admin-provisioned atomically; no public registration and no self-service password reset.

---

## B. Current Repository Problems

| # | Finding | Classification | Evidence |
|---|---------|---------------|----------|
| B1 | **Santri has no authentication identity.** The `santris` table has no `user_id` FK; Santri cannot log in. | [VERIFIED] | [Santri model](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Models/Santri.php), [santris migration](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000001_create_santris_table.php) |
| B2 | **Santri has its own `email` column** independent of `users.email`. Domain meaning unresolved — may be contact/guardian email or may duplicate login email. | [VERIFIED] | [santris migration L21](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000001_create_santris_table.php#L21) |
| B3 | **`RegisteredUserController` still exists on disk** despite routes being removed. Dead code creates `User::create()` without a role. | [VERIFIED] | [RegisteredUserController](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Auth/RegisteredUserController.php#L40-L44) |
| B4 | **`Register.jsx` still exists on disk** despite routes being removed. Orphan frontend component. | [VERIFIED] | Build output includes `Register-kzP00JZ3.js` (2.36 kB) |
| B5 | **`role` is an unconstrained string** — any arbitrary value can be stored. No DB-level or model-level constraint. | [VERIFIED] | [role migration](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_14_233428_add_role_to_users_table.php#L15), `SHOW COLUMNS` confirms `varchar(255)` with no key |
| B6 | **`role` is in User `$fillable`** — a mass-assignment risk if raw request data is ever passed to `User::create()` or `$user->update()`. | [VERIFIED] | [User.php L22](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Models/User.php#L22) |
| B7 | **Dashboard redirect logic is duplicated** in 4 controllers as `$user->role === 'admin' ? 'admin.dashboard' : 'ustadz.dashboard'`, silently routing any non-admin role (including future `santri` or malformed values) to `ustadz.dashboard`. | [VERIFIED] | [AuthenticatedSessionController L39-46](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Auth/AuthenticatedSessionController.php#L39-L46), [ConfirmablePasswordController L40](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Auth/ConfirmablePasswordController.php#L40), [VerifyEmailController L18](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Auth/VerifyEmailController.php#L18), [EmailVerificationPromptController L20](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Auth/EmailVerificationPromptController.php#L20) |
| B8 | **`ProfileController@destroy` hard-deletes a User** without checking dependent records. Current `onDelete('cascade')` FKs would wipe all academic history. | [VERIFIED] | [ProfileController L56](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/ProfileController.php#L56), cascade rules on [jadwals](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000002_create_jadwals_table.php#L13), [penilaians](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000003_create_penilaians_table.php#L13), [materis](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000004_create_materis_table.php#L13) |
| B9 | **No Santri factory exists.** Only `UserFactory` is present. | [VERIFIED] | [factories directory](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/factories) |
| B10 | **`UserFactory` defaults to `'ustadz'`** — adequate for test convenience but must be documented as not representing the only valid state. | [VERIFIED] | [UserFactory L33](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/factories/UserFactory.php#L33) |
| B11 | **`FormRequest::authorize()` returns `true` unconditionally** on all custom Form Requests, bypassing authorization entirely. | [VERIFIED] | All FormRequest files in `app/Http/Requests/` |
| B12 | **Self-service password reset routes still exist** (`forgot-password`, `reset-password`). Product decision requires Admin-managed credential reset only. | [VERIFIED] | [auth.php L20-L30](file:///home/adminfid/Documents/Projects/sistem-pesantren/routes/auth.php#L20-L30) |
| B13 | **`users.role` has no index.** Queries like `User::where('role', 'ustadz')` are used in 6+ controllers. With a small user table this is not a bottleneck, but an index is warranted as the table grows. | [VERIFIED] | `SHOW INDEX FROM users` returns only `PRIMARY` and `users_email_unique` |

---

## C. Recommended Relationship Diagram

```
┌───────────────────────────────────────────────────────────┐
│                        users                              │
│───────────────────────────────────────────────────────────│
│  id  │ name │ email │ role(enum) │ password │ is_active   │
│      │      │       │ admin      │          │ (bool, def  │
│      │      │       │ ustadz     │          │  true)      │
│      │      │       │ santri     │          │             │
└──┬─────────────┬──────────────────────────────────────────┘
   │             │
   │ 1           │ 1 (required, unique)
   │             │
   ▼ *           ▼ 1
┌──────────┐   ┌──────────────────────────────────────────┐
│ jadwals  │   │                santris                    │
│──────────│   │──────────────────────────────────────────│
│ user_id──│   │  id │ user_id (NOT NULL, UNIQUE FK)      │
│ (ustadz) │   │     │ nis │ nama │ kelas │ status │ ...  │
└──────────┘   └──┬───────────────────────────────────────┘
                  │
   ┌──────────────┤
   │ 1            │ 1
   ▼ *            ▼ *
┌──────────┐   ┌──────────────┐
│ materis  │   │  penilaians  │
│──────────│   │──────────────│
│ user_id──│   │ user_id ─────│──(Ustadz who graded)
│ (ustadz) │   │ santri_id ───│──(Student graded)
└──────────┘   │ subject_id ──│
               └──────────────┘

FK behavior:
  jadwals.user_id      → users.id    ON DELETE RESTRICT
  materis.user_id      → users.id    ON DELETE RESTRICT
  penilaians.user_id   → users.id    ON DELETE RESTRICT
  penilaians.santri_id → santris.id  ON DELETE RESTRICT
  santris.user_id      → users.id    ON DELETE RESTRICT

Routing:
  /admin/...   → role:admin middleware
  /ustadz/...  → role:ustadz middleware
  /santri/...  → role:santri middleware (future)
```

---

## D. User Model Responsibility

**[DECISION]** The `users` table owns:

| Column | Purpose |
|--------|---------|
| `id` | Primary key, referenced by all domain FKs |
| `name` | Display name for all actors |
| `email` | Login credential (unique) |
| `password` | Hashed credential |
| `role` | Enum: `admin`, `ustadz`, `santri` |
| `is_active` | Boolean, default `true` — enables account deactivation without deletion |
| `email_verified_at` | Standard Breeze verification |
| `remember_token` | Standard session persistence |
| `timestamps` | `created_at`, `updated_at` |

**What `users` does NOT own:** Academic biographical data (NIS, kelas, jenis_kelamin, tanggal_lahir, alamat, program) — these belong on `santris`.

**Justification:** All three actors need the identical set of authentication fields. The `users` table already holds exactly these fields. Adding `is_active` is the only schema addition needed for account lifecycle management.

---

## E. Santri Model Responsibility

**[DECISION]** `santris` retains all current biographical/academic fields **plus** a new **required** `user_id` FK to `users`.

| Column | Status | Purpose |
|--------|--------|---------|
| `user_id` | **NEW** — `NOT NULL, UNIQUE, FK → users.id, ON DELETE RESTRICT` | Links to authentication identity. Every Santri must have a login account. |
| `nis` | Existing | Institutional student number |
| `nama` | Existing | Student's full name (authoritative biographical name) |
| `jenis_kelamin` | Existing | Gender |
| `tanggal_lahir` | Existing | Birth date |
| `alamat` | Existing | Address |
| `kelas` | Existing | Current class (string, future normalization in P0-4) |
| `program` | Existing | Academic program |
| `status` | Existing | `aktif`, `alumni`, `keluar` |
| `email` | Existing — **domain clarification required** | See Section S |
| `telepon` | Existing | Contact phone |

### Why `santris.user_id → users.id` is correct:

| Criterion | Analysis |
|-----------|----------|
| **Referential integrity** | FK on child table pointing to parent. Standard relational pattern. NOT NULL + UNIQUE guarantees a strict one-to-one relationship. |
| **Lifecycle** | Deactivating the User (`is_active = false`) doesn't require touching the Santri academic record. Santri biographical data persists independently. `ON DELETE RESTRICT` prevents accidental deletion. |
| **Account provisioning** | Admin creates User and Santri atomically in one transaction. No valid steady state where a Santri exists without a User. |
| **Query ergonomics** | `$santri->user` (belongsTo) and `$user->santri` (hasOne). `Penilaian::where('santri_id', $id)` works unchanged. |
| **Future submissions/assignments** | `submissions.santri_id` naturally references the academic identity. `$submission->santri->user` reaches the login account when needed. |
| **Why NOT nullable** | Product decision: there must not be a valid steady state where a Santri exists without a User. Atomic provisioning enforces this at the application level; NOT NULL enforces it at the database level. |

---

## F. Ustadz Model Decision

*(Unchanged from original report.)*

**[DECISION]** No separate Ustadz model or table is needed.

**Repository evidence:**

1. `Admin\UstadzController` already manages Ustadz as `User::where('role', 'ustadz')` — [UstadzController.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Admin/UstadzController.php).
2. Teaching assignments are expressed via `jadwals.user_id`, material ownership via `materis.user_id`, grading via `penilaians.user_id`.
3. No Ustadz-specific biographical fields exist in the current schema or PRD.

If future domain data emerges (e.g., `nip` staff number, `spesialisasi`), the decision should be revisited.

---

## G. Admin Model Decision

*(Unchanged from original report.)*

**[DECISION]** No separate Admin model or table. Admin is a role on `users`. Admin-to-Admin web provisioning is deferred; seeder/CLI provisioning is sufficient during recovery.

---

## H. Role Representation Decision

*(Unchanged from original report.)*

**[DECISION]** PHP backed enum cast on the User model.

```php
enum UserRole: string
{
    case Admin = 'admin';
    case Ustadz = 'ustadz';
    case Santri = 'santri';

    public function dashboardRoute(): string
    {
        return match ($this) {
            self::Admin => 'admin.dashboard',
            self::Ustadz => 'ustadz.dashboard',
            self::Santri => 'santri.dashboard',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Ustadz => 'Ustadz',
            self::Santri => 'Santri',
        };
    }
}
```

---

## I. Account Provisioning Flows

### Create Ustadz
```
Admin → POST /admin/ustadz
  → StoreUstadzRequest validates name, email, password
  → User::create(['role' => UserRole::Ustadz, ...])
```
**[VERIFIED]** This flow already exists and works correctly in [UstadzController@store](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Admin/UstadzController.php#L40-L47).

### Create Santri (Atomic User + Academic Record)
```
Admin → POST /admin/santri
  → StoreSantriRequest validates biographical fields + email + password
  → DB::transaction:
      1. User::create(['role' => UserRole::Santri, 'name' => $nama, 'email' => ..., 'password' => ...])
      2. Santri::create([..., 'user_id' => $user->id])
  → Rollback both if either fails
```
**[DECISION]** The current `Admin\SantriController@store` creates only a Santri record without a User. It must be updated to atomically create both. The `StoreSantriRequest` must be extended to validate login credential fields (`email` unique against `users`, `password`).

Provisioning is individual (one Santri at a time). Bulk provisioning is deferred until real usage demonstrates the need.

### Create Admin
```
Currently: Only via DatabaseSeeder or CLI (php artisan tinker).
```
**[DECISION]** Seeder/CLI provisioning is sufficient during recovery. Admin-to-Admin web provisioning is deferred unless a concrete operational requirement emerges.

### Edit Account Identity (Ustadz)
```
Admin → PUT /admin/ustadz/{id} (name, email, password)
  → UpdateUstadzRequest validates
  → User::update([...])
```
**[VERIFIED]** Exists. Role is NOT editable via this form (hardcoded filter `where('role', 'ustadz')`). Correct.

### Edit Santri (Academic Profile + Account Identity)
```
Admin → PUT /admin/santri/{id}
  → UpdateSantriRequest validates biographical fields
  → Santri::update([...])
  → If email or name changed, also update the linked User record within a transaction
```
**[DECISION]** The edit flow must consider whether changes to `nama` on the Santri record should propagate to `users.name`. This should be decided during implementation — the simplest correct approach is to update both atomically when the Admin edits a Santri.

### Credential Reset (Admin-Managed)
```
Future flow (not implemented yet):
Admin → POST /admin/users/{id}/reset-password
  → Generate or accept a new temporary password
  → Hash and store on User
  → Optionally set a flag: must_change_password = true
  → No SMTP, no email sent — Admin communicates credentials directly
```
**[DECISION]** Self-service password reset routes (`forgot-password`, `reset-password`) should be removed from `routes/auth.php` as part of this architecture work. There is no SMTP dependency for password recovery. The Admin-managed reset flow is deferred to implementation but the architecture must accommodate a future `must_change_password` boolean on `users` or equivalent mechanism.

### Deactivate Account
**[DECISION]** Set `users.is_active = false`. Middleware checks `is_active` and rejects authentication from deactivated accounts. Sessions should be invalidated on deactivation. Academic/domain records remain preserved.

### Delete Domain Record
**[DECISION]** Destructive deletion is the exception, not the norm. Prefer deactivation. `ON DELETE RESTRICT` on all academic FKs prevents accidental history destruction at the database level. If a Santri record must be deleted (e.g., data entry error before any grades exist), the application must first verify no dependent `penilaians` exist, then delete the Santri, then delete the User — or rely on the restrict constraint to surface the error.

---

## J. Account Lifecycle

| Event | Authentication (`users`) | Academic (`santris`) | Academic History |
|-------|-------------------------|---------------------|-----------------|
| **Santri graduates** | Set `is_active = false` | Set `status = 'alumni'` | Penilaians preserved; User and Santri records retained |
| **Santri leaves** | Set `is_active = false` | Set `status = 'keluar'` | Penilaians preserved |
| **Ustadz becomes inactive** | Set `is_active = false` | N/A (no profile table) | Jadwals, Materis, Penilaians preserved (User record retained) |
| **Admin deactivation** | Set `is_active = false` | N/A | N/A |
| **Data correction (no history)** | Delete User only if restrict FK allows | Delete Santri first (requires no penilaians) | Not applicable |
| **Credential forgotten** | Admin resets password directly (no SMTP) | Unaffected | Unaffected |

**[DECISION]** `onDelete('cascade')` on `jadwals.user_id`, `materis.user_id`, `penilaians.user_id`, and `penilaians.santri_id` must all change to `onDelete('restrict')`. The new `santris.user_id` FK also uses `onDelete('restrict')`.

Account deactivation is always preferred over deletion. Deletion controllers (`Admin\UstadzController@destroy`, `Admin\SantriController@destroy`, `ProfileController@destroy`) must be updated to either:
- Deactivate instead of delete, or
- Check for dependent records and refuse deletion when history exists.

---

## K. Login Redirect Architecture

*(Unchanged from original report.)*

**[DECISION]** Centralize on the `UserRole` enum's `dashboardRoute()` method.

```php
// Usage in all auth controllers (replaces 4 duplicated ternaries):
return redirect()->intended(route($user->role->dashboardRoute(), absolute: false));
```

Invalid/malformed role: the enum cast throws `ValueError` on invalid values, surfacing data corruption rather than silently misrouting. `RoleMiddleware` provides defense in depth.

---

## L. Authorization Implications

*(Unchanged from original report.)*

The identity model separates:

- **Role authorization** (middleware): "Is this user an Ustadz?" → `role:ustadz`
- **Resource authorization** (future Policies, P0-3): "Does this Ustadz own this Materi?" → `$materi->user_id === $user->id`

Santri identity chain for resource auth:
```
$user (role: santri)
  → $user->santri (hasOne, via santris.user_id)
    → $santri->penilaians (hasMany, via penilaians.santri_id)
```

---

## M. Database Changes Required

### Migrations to Edit (Pre-Production Direct Edit Policy)

| File | Change | Rationale |
|------|--------|-----------|
| [`0001_01_01_000000_create_users_table.php`](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/0001_01_01_000000_create_users_table.php) | Add `$table->boolean('is_active')->default(true)` to the `users` schema | Account lifecycle support |
| [`2026_06_14_233428_add_role_to_users_table.php`](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_14_233428_add_role_to_users_table.php) | Add `$table->index('role')` | The `role` column currently has no index (verified via `SHOW INDEX`). Queries like `User::where('role', 'ustadz')` appear in 6+ controllers. |
| [`2026_06_15_000001_create_santris_table.php`](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000001_create_santris_table.php) | Add `$table->foreignId('user_id')->unique()->constrained()->onDelete('restrict')` (NOT NULL) | Required Santri → User authentication linkage |
| [`2026_06_15_000002_create_jadwals_table.php`](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000002_create_jadwals_table.php) | Change `->onDelete('cascade')` to `->onDelete('restrict')` on `user_id` FK | Prevent accidental history destruction |
| [`2026_06_15_000003_create_penilaians_table.php`](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000003_create_penilaians_table.php) | Change `->onDelete('cascade')` to `->onDelete('restrict')` on both `user_id` and `santri_id` FKs | Prevent accidental history destruction |
| [`2026_06_15_000004_create_materis_table.php`](file:///home/adminfid/Documents/Projects/sistem-pesantren/database/migrations/2026_06_15_000004_create_materis_table.php) | Change `->onDelete('cascade')` to `->onDelete('restrict')` on `user_id` FK | Prevent accidental history destruction |

### Routes to Edit

| File | Change | Rationale |
|------|--------|-----------|
| [`routes/auth.php`](file:///home/adminfid/Documents/Projects/sistem-pesantren/routes/auth.php) | Remove `forgot-password` (GET + POST) and `reset-password` (GET + POST) routes | Admin-managed credential reset only; no SMTP dependency |

### Files to Delete

| File | Reason |
|------|--------|
| [`app/Http/Controllers/Auth/RegisteredUserController.php`](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Auth/RegisteredUserController.php) | Dead code — routes removed in P0-1A. **Approved for deletion.** |
| `resources/js/Pages/Auth/Register.jsx` | Dead code — unreachable frontend component. **Approved for deletion.** |

### Files to Create

| File | Purpose |
|------|---------|
| `app/Enums/UserRole.php` | PHP backed enum for role representation |
| `database/factories/SantriFactory.php` | Test factory for Santri model |

### Files to Update (Application Logic)

| File | Change | Rationale |
|------|--------|-----------|
| `app/Models/User.php` | Add `role` → `UserRole` cast; add `santri()` hasOne; remove `role` from `$fillable` | Type safety + relationship + mass-assignment fix |
| `app/Models/Santri.php` | Add `user_id` to `$fillable`; add `user()` belongsTo | Authentication linkage |
| `app/Http/Middleware/RoleMiddleware.php` | Use `UserRole` enum comparison | Type safety |
| `app/Http/Controllers/Auth/*` (4 files) | Replace ternary redirects with `$user->role->dashboardRoute()` | Eliminate duplication |
| `app/Http/Controllers/Admin/SantriController.php` | Atomic User + Santri creation in `store()`; restrict-aware `destroy()` | Mandatory linkage + history protection |
| `app/Http/Requests/StoreSantriRequest.php` | Add `email`, `password` validation rules | Login credential provisioning |
| `database/seeders/DatabaseSeeder.php` | Create Users for seeded Santri; use `UserRole` enum | Consistency with new schema |
| `database/factories/UserFactory.php` | Use `UserRole::Ustadz` instead of string | Type safety |

---

## N. Required Eloquent Relationships

### User Model
```php
// Already exists:
public function jadwals()    // hasMany — Ustadz teaching assignments
public function materis()    // hasMany — Ustadz uploaded materials  
public function penilaians() // hasMany — Ustadz-created grades

// NEW:
public function santri()     // hasOne — only populated for role:santri users
{
    return $this->hasOne(Santri::class);
}
```

### Santri Model
```php
// Already exists:
public function penilaians() // hasMany — grades received

// NEW:
public function user()       // belongsTo — login account (required)
{
    return $this->belongsTo(User::class);
}
```

### No changes needed on:
- `Jadwal` (already has `ustadz()` → belongsTo User)
- `Materi` (already has `ustadz()` → belongsTo User)
- `Penilaian` (already has `ustadz()` → belongsTo User, `santri()` → belongsTo Santri)
- `Subject` (no identity relationship)

---

## O. Required Indexes and Constraints

### Verified Current Index State

Inspected via `SHOW INDEX FROM <table>` against the running MySQL database:

| Table | Existing Indexes |
|-------|-----------------|
| `users` | `PRIMARY (id)`, `users_email_unique (email)` |
| `santris` | `PRIMARY (id)`, `santris_nis_unique (nis)` |
| `jadwals` | `PRIMARY (id)`, `jadwals_user_id_foreign (user_id)`, `jadwals_subject_id_foreign (subject_id)` |
| `penilaians` | `PRIMARY (id)`, `penilaian_unique (santri_id, subject_id, user_id)`, `penilaians_user_id_foreign (user_id)`, `penilaians_subject_id_foreign (subject_id)` |
| `materis` | `PRIMARY (id)`, `materis_user_id_foreign (user_id)`, `materis_subject_id_foreign (subject_id)` |
| `subjects` | `PRIMARY (id)`, `subjects_kode_mapel_unique (kode_mapel)` |

> [!NOTE]
> MySQL/InnoDB automatically creates indexes on FK columns. All `user_id`, `subject_id`, and `santri_id` FK columns already have single-column indexes. The claim in the original report (B12) that FK columns lack indexes was incorrect and has been removed.

### New Indexes Required

| Table | Index | Type | Justification |
|-------|-------|------|---------------|
| `users` | `role` | Single-column index | **Verified absent** — `SHOW INDEX FROM users` shows no `role` index. Used in `User::where('role', 'ustadz')` across 6+ controllers including `UstadzController`, `JadwalController`, and `DashboardController`. |
| `santris` | `user_id` | Unique FK (auto-indexed) | New column — the UNIQUE + FK constraint will create the index automatically |

### Composite Index Evaluation

| Candidate | Query Pattern | Verdict |
|-----------|--------------|---------|
| `jadwals (user_id, subject_id)` | `Jadwal::where('user_id', $id)->where('subject_id', $id)` in PenilaianController | **Deferred** — the existing single-column `jadwals_user_id_foreign` index sufficiently narrows the result set for the current scale. The `subject_id` filter operates on a small subset. Add only if query profiling demonstrates a bottleneck. |
| `materis (user_id, subject_id)` | `Materi::where('user_id', Auth::id())->where('subject_id', $id)` in MateriController | **Deferred** — same reasoning as above. |
| `penilaians (user_id, subject_id)` | `Penilaian::where('user_id', $id)->where('subject_id', $id)` in PenilaianController | **Already effectively covered** by the existing `penilaian_unique (santri_id, subject_id, user_id)` composite unique constraint — MySQL can use trailing columns of a composite index in some query plans, but the leading column is `santri_id`, not `user_id`. However, the single-column `penilaians_user_id_foreign` index is sufficient for the current scale. **Deferred.** |

---

## P. Implementation Sequence

Each step is a small, independently committable unit:

### Step 1: Create UserRole Enum + Cast
- Create `app/Enums/UserRole.php` with `Admin`, `Ustadz`, `Santri` cases and `dashboardRoute()`, `label()` methods
- Add enum cast to User model
- Update `RoleMiddleware` to use enum
- Update all `$user->role === 'string'` comparisons to use enum
- Update `UserFactory` to use enum
- Update `DatabaseSeeder` to use enum
- Run tests

### Step 2: Centralize Dashboard Redirect
- Replace duplicated ternary logic in 4 auth controllers with `$user->role->dashboardRoute()`
- Run tests

### Step 3: Remove Dead Code
- Delete `RegisteredUserController.php`
- Delete `resources/js/Pages/Auth/Register.jsx`
- Remove the `use` import from `routes/auth.php` (already unused)
- Run build, run tests

### Step 4: Remove Self-Service Password Reset Routes
- Remove `forgot-password` (GET + POST) and `reset-password` (GET + POST) routes from `routes/auth.php`
- Delete or keep `PasswordResetLinkController` and `NewPasswordController` based on whether they are referenced elsewhere (the controllers themselves are harmless without routes, but clean deletion is preferred)
- Remove `ForgotPassword.jsx` and `ResetPassword.jsx` frontend pages
- Update login page to remove "Forgot your password?" link
- Run build, run tests

### Step 5: Remove `role` from User `$fillable` + Add `is_active`
- Remove `'role'` from `$fillable` array
- Ensure `UstadzController@store` sets role directly (already does)
- Edit `0001_01_01_000000_create_users_table.php` to add `is_active` boolean
- Edit `2026_06_14_233428_add_role_to_users_table.php` to add `role` index
- Add active-user check in middleware (extend `RoleMiddleware` or add dedicated middleware)
- Run `migrate:fresh --seed`
- Add tests for inactive user rejection

### Step 6: Change FK Cascade to Restrict
- Edit `jadwals`, `materis`, `penilaians` migrations: `cascade` → `restrict`
- Update `Admin\UstadzController@destroy` to deactivate or check for dependent records
- Update `Admin\SantriController@destroy` to deactivate or check for dependent records
- Update `ProfileController@destroy` to prevent self-deletion when records exist
- Run `migrate:fresh --seed`
- Add tests

### Step 7: Add Required `santris.user_id` FK + Atomic Provisioning
- Edit `create_santris_table.php` migration to add NOT NULL `user_id` FK (unique, restrict)
- Add `User::santri()` hasOne relationship
- Add `Santri::user()` belongsTo relationship
- Add `user_id` to `Santri::$fillable`
- Create `SantriFactory` (creates a `role:santri` User and links it)
- Update `Admin\SantriController@store` for atomic User + Santri creation within `DB::transaction`
- Extend `StoreSantriRequest` with email + password validation
- Update `DatabaseSeeder` to create Users for Santri records
- Run `migrate:fresh --seed`
- Add tests

### Step 8: Documentation Updates
- Update `CURRENT_STATE.md` to reflect architecture decisions
- Update `ROADMAP.md` to mark P0-1B items completed
- Update `DESIGN.md` Section 3 with finalized identity architecture

---

## Q. Testing Requirements

| Test | Type | Asserts |
|------|------|---------|
| Admin provisions Ustadz account | Feature | `POST /admin/ustadz` creates User with `role = ustadz` |
| Admin provisions Santri (atomic) | Feature | `POST /admin/santri` creates both User (`role = santri`) and Santri within one transaction |
| Santri provisioning rolls back on User failure | Feature | Invalid email → neither User nor Santri created |
| Santri provisioning rolls back on Santri failure | Feature | Invalid NIS → neither User nor Santri created |
| Santri `user_id` unique constraint | Feature | Cannot link two Santri to the same User |
| Santri cannot exist without User | Feature | Database rejects `INSERT INTO santris` with null or invalid `user_id` |
| Role-based login redirect: Admin → admin.dashboard | Feature | Already covered by existing tests |
| Role-based login redirect: Ustadz → ustadz.dashboard | Feature | Already covered |
| Role-based login redirect: Santri → santri.dashboard | Feature | Future — when Santri routes exist |
| Invalid role handling | Feature | User with invalid role string cannot reach any dashboard |
| Inactive user cannot log in | Feature | `is_active = false` → login attempt rejected |
| Inactive user's session is rejected | Feature | Previously-authenticated user with `is_active = false` gets redirected |
| Ustadz deletion blocked when records exist | Feature | `DELETE /admin/ustadz/{id}` fails when jadwals/materis/penilaians depend on user |
| Santri deletion blocked when penilaians exist | Feature | `DELETE /admin/santri/{id}` fails when grades exist |
| Restrict FK prevents User deletion | Feature | Database rejects user deletion when dependent records exist |
| Role cannot be mass-assigned | Unit | Mass assignment of `role` via `$fillable` is not possible |
| `UserRole::dashboardRoute()` correctness | Unit | Returns correct route name for each enum case |
| Self-service password reset unavailable | Feature | `GET /forgot-password` returns 404; `POST /forgot-password` returns 404 |
| Registration unavailable | Feature | Already covered by existing `RegistrationTest` |
| Guest cannot access any dashboard | Feature | Already covered by existing `RoleAccessTest` |
| Cross-role access forbidden | Feature | Already covered by existing `RoleAccessTest` |

---

## R. Risks and Trade-offs

| Risk | Mitigation | Severity |
|------|-----------|----------|
| **NOT NULL `user_id` makes Santri import harder** — bulk data migration from legacy systems must create User accounts simultaneously | Accept: the atomic provisioning pattern handles this. Legacy import scripts must follow the same transaction pattern. Individual provisioning is the approved workflow; bulk is deferred. | Low |
| **Removing self-service password reset shifts burden to Admin** | Accept: this is an explicit product decision. The pesantren is an institutional environment where Admin manages accounts. Future `must_change_password` flag provides UX for credential handoff. | Low — by design |
| **`restrict` FK prevents legitimate data cleanup** | Implement deactivation-first patterns in controllers. For genuine data corrections (pre-grade entry), delete Santri then User in order. Restrict constraint surfaces errors rather than silently destroying data. | Low |
| **`santris.email` semantics unresolved** | Marked as domain clarification in Section S. Implementation must not proceed on this column until resolved. | Medium — blocks schema finalization |
| **Enum does not cover future roles** | Add a case to the enum — a one-line change with compile-time safety via exhaustive `match()`. No schema change needed. | Negligible |
| **Admin credential reset requires secure handoff** | Out of scope for architecture. Admin communicates temporary password via institutional channels (in-person, printed slip). `must_change_password` flag forces immediate change on next login. | Low — deferred |
| **No SMTP means no email verification flow** | Email verification routes still exist but serve no purpose without SMTP for Santri accounts. Consider removing email verification routes in a future cleanup, or retaining them for an eventual SMTP enablement. | Low |

---

## S. Decisions Requiring User Input Before Implementation

> [!IMPORTANT]
> The following items are the **only remaining unresolved decisions**. All other architecture decisions in this report are finalized.

### S1. Santri `email` Column Semantics

**[DOMAIN CLARIFICATION REQUIRED]**

The `santris` table has an `email` column. With the new architecture, every Santri also has a `users.email` (their login credential). The question:

- **If `santris.email` duplicates `users.email`:** Remove it from `santris`. The login email on `users` is the single source of truth.
- **If `santris.email` is a distinct contact/guardian email:** Rename it to reflect its actual domain meaning (e.g., `email_wali` for guardian, `contact_email` for general contact).

This must be resolved before the `santris` migration is edited, because the column semantics affect the Santri create form, validation rules, and seeder data.

### S2. Email Verification Routes

**[DEFERRED DECISION]**

With self-service password reset removed and no SMTP dependency, the email verification flow (`verify-email`, `verification.send`, `verification.verify`) has limited utility. Options:

- **Keep:** Retain the routes for a future SMTP enablement. No harm — they are behind `auth` middleware.
- **Remove:** Strip email verification routes and controllers for a cleaner auth surface.

This does not block implementation. The routes can remain temporarily.

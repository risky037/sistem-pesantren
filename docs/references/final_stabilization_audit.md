# Final Stabilization Audit Report

**Branch:** `main` (HEAD: `df4d02b`)
**Audited:** 2026-09-13
**Scope:** Post P0 completion — read-only audit, no code changes

---

## Audit Status Summary

| Section | Status |
|---------|--------|
| 1. Documentation Consistency | INCONSISTENCIES FOUND |
| 2. Repository Documentation Hygiene | STALE FILES EXIST |
| 3. Architecture Consistency | MINOR GAPS IDENTIFIED |
| 4. Test Baseline | 71 tests, all passing |
| 5. Route Inventory | 52 routes, classified |
| 6. Production Readiness | NOT PRODUCTION-READY |

---

## 1. Documentation Consistency Audit

### 1.1 P0 Milestone Status vs. ROADMAP

The `ROADMAP.md` P0 section reflects an **earlier snapshot** and is significantly out of date.

#### Verified Completed Milestones (reflected in code):

| Milestone | ROADMAP Status | Actual State |
|-----------|----------------|--------------|
| P0-1A: Disable public registration | `[COMPLETED]` | VERIFIED — `/register` returns 404; `RegisteredUserController` deleted; `Register.jsx` deleted |
| P0-1B.1: Typed `UserRole` enum + redirect consolidation | `[COMPLETED]` | VERIFIED — `UserRole` enum exists, `RoleMiddleware` uses enum, auth controllers use `dashboardRouteName()` |
| P0-1B.2: Remove self-service password reset | `[DEFERRED]` per ROADMAP | ACTUALLY COMPLETED — `forgot-password` and `reset-password` routes removed; `PasswordResetTest` asserts all return 404 |
| P0-1B.2: Admin-managed password reset (Ustadz) | Not in ROADMAP | ACTUALLY COMPLETED — `UstadzController@resetPassword` + `admin.ustadz.reset-password` route |
| P0-1B.2: Admin-managed password reset (Santri) | Not in ROADMAP | ACTUALLY COMPLETED — `SantriController@resetPassword` + `admin.santri.reset-password` route |
| P0-1B.3: Account lifecycle (`is_active`, deactivate/reactivate) | Not in ROADMAP | ACTUALLY COMPLETED — `is_active` column in migration, `InactiveUserTest`, deactivate/reactivate routes |
| P0-1B.4: Santri identity architecture (`santris.user_id` FK, atomic provisioning) | `[DEFERRED]` per ROADMAP | ACTUALLY COMPLETED — `santris.user_id` FK (NOT NULL, UNIQUE, RESTRICT), `SantriController@store` uses `DB::transaction`, `SantriFactory` exists |
| P0-2: Test baseline | `[COMPLETED]` | VERIFIED — 71 passing tests |
| P0-3: Authorization hardening (Policies) | Listed as tasks only | ACTUALLY COMPLETED — `MateriPolicy`, `PenilaianPolicy`, `JadwalPolicy` created and in use |

#### Inconsistencies in ROADMAP:

- **FACT:** ROADMAP line 20 marks `P0-1B.2+` as `[DEFERRED]`. All P0-1B.2, P0-1B.3, and P0-1B.4 work has been completed and merged to `main`.
- **FACT:** ROADMAP line 21 says "Administrative Provisioning: Implement Admin-controlled provisioning workflows" without a completion marker — this is done.
- **FACT:** P0-3 items (Policies) are listed as tasks but never marked `[COMPLETED]`.
- **FACT:** P0-4, P0-5, P0-6, P0-7 have no completion markers. Based on code inspection, **none of these are completed**.

### 1.2 CURRENT_STATE.md vs. Actual Code

| Claim in CURRENT_STATE.md | Actual Status |
|---------------------------|---------------|
| Line 19: "The application defines 28 total registered web routes" | OUTDATED — 52 routes now registered |
| Line 34: "Student Flow: Currently missing." | OUTDATED — A stub `santri.dashboard` route exists at `GET /santri/dashboard` |
| Line 52: "Student Portal: Missing — No authentication identity..." | OUTDATED — Santri now have `user_id` FK, `User::santri()` hasOne, `Santri::user()` belongsTo |
| Line 43: "Resolved (P0-1A): Public registration is disabled" | CORRECT |
| Line 43: "Resolved (P0-1B.1): Typed `UserRole` enum introduced" | CORRECT |
| Line 103: "38 tests currently pass (100%)" | OUTDATED — 71 tests now pass |
| Lines 73-77: Section 5 describing Santri as having no `user_id` FK | OUTDATED — FK now exists and is enforced |
| Lines 121-125: Section 9 "Legacy Documentation Notice" flagging stale files | CORRECT, still accurate |

### 1.3 DESIGN.md vs. Actual Code

| Design claim | Actual status |
|---|---|
| Section 3.2 "Native Enum Casting Deferred" | PARTIALLY OUTDATED — Native casting is still deferred (no `$casts` entry), but `role` is removed from `$fillable`. Reasoning remains sound but risk profile has changed. |
| Section 3.2 "`dashboardRouteName()` maps Santri to `null`" | OUTDATED — `UserRole::Santri->dashboardRouteName()` now returns `'santri.dashboard'` (not `null`). The fail-closed logout path is never reached for Santri logins. |
| Section 3.2 "Fail-Closed Security Invariant" | PARTIALLY OUTDATED — The description says Santri logins are terminated with 403. Code now directs Santri to `santri.dashboard`, but no frontend page exists for this route. Santri login will error. |

### 1.4 PRD.md vs. Actual Code

| PRD claim | Actual status |
|---|---|
| Section 6, Q1: Public Registration Policy | Resolved in code (disabled), but still listed as open |
| Section 6, Q2: Santri Authentication Contract | Resolved in code (`santris.user_id` FK implemented), but still listed as open |
| Section 6, Q3-Q5: Academic Period, Grading Scale, Submission Policies | Still genuinely unresolved |

---

## 2. Repository Documentation Hygiene

### Root Markdown Files

| File | Classification | Recommendation |
|------|---------------|----------------|
| `AGENTS.md` | **Authoritative** — project rules and agent instructions, up to date | **KEEP** |
| `README.md` | **Authoritative** — project overview, setup instructions | **KEEP** (update the WARNING alert — it still states public registration defaults to `ustadz` role, which was fixed in P0-1A) |
| `implementation_plan.md` | **Historical AI artifact** — P0-3 planning document; fully executed and merged | **MOVE to `docs/archive/`** or **DELETE** — superseded by `authorization_architecture.md` |
| `IMPLEMENTATION_SUMMARY.md` | **Obsolete AI artifact** — scaffold document claiming "production ready (UI/Frontend)" with no database; models listed as "Coming Soon" | **MOVE to `docs/archive/`** or **DELETE** |
| `MENU_CRUD_GUIDE.md` | **Obsolete AI artifact** — early-stage UI-only guide with sample credentials in plaintext | **MOVE to `docs/archive/`** or **DELETE** |

### docs/references/ Files

| File | Classification | Recommendation |
|------|---------------|----------------|
| `account_identity_architecture.md` | **Authoritative ADR** — comprehensive, still largely accurate | **KEEP** (minor update: `santri.dashboard` route now exists) |
| `credential_lifecycle_architecture.md` | **Authoritative ADR** — accurately documents decisions made | **KEEP** |
| `authorization_architecture.md` | **Authoritative ADR** — Section 1 is now outdated (policies exist); Sections 2-5 are historical | **KEEP** (add completion note to Sections 1 and 8) |

---

## 3. Architecture Consistency Review

### 3.1 Identity Architecture

**Users:**

- FACT: `users` table columns: `id, name, email, email_verified_at, password, is_active (bool, default true), remember_token, timestamps` plus `role` (string, indexed) in a separate migration.
- FACT: `role` is NOT in `$fillable`. `is_active` IS in `$fillable`. Correct.
- FACT: No native enum cast on `$casts` for `role`. `User::roleEnum()` provides safe defensive conversion via `UserRole::tryFrom()`.
- FINDING: `email_verified_at` column remains in `users` table. `ProfileController@update` still resets it to `null` on email change. No email verification routes exist. Dead logic — low risk.

**Santris:**

- FACT: `santris.user_id` is NOT NULL, UNIQUE, FK to `users.id ON DELETE RESTRICT`.
- FACT: `Santri::user()` belongsTo and `User::santri()` hasOne relationships exist.
- FACT: `santris` table retains an `email` column. The seeder populates it but `StoreSantriRequest` does not validate or persist it. The column is orphaned — not read, not written by the create form.
- FINDING (UNRESOLVED): `santris.email` semantics remain unresolved from `account_identity_architecture.md` Section S1. The seeder uses it as biographical email, but the application form does not.

**Roles:**

- FACT: `UserRole` enum: `Admin = 'admin'`, `Ustadz = 'ustadz'`, `Santri = 'santri'`.
- FACT: `UserFactory` defaults to `UserRole::Ustadz->value`. Documented.
- FACT: `UserFactory` has `admin()`, `ustadz()`, `santri()`, and `inactive()` states.
- FINDING: `SantriFactory` exists and is functional (used in tests successfully).

**Lifecycle:**

- FACT: `is_active` check in `AuthenticatedSessionController@store` — inactive users cannot log in.
- FACT: `InactiveUserTest` covers inactive login rejection, mid-session rejection, and admin deactivation.
- FACT: `UstadzController` has `deactivate()`, `reactivate()`, `destroy()` (with dependent-record guard).
- FACT: `SantriController@destroy` guards on `penilaians()->exists()` before deletion and uses `DB::transaction` to delete Santri then User.
- FACT: `ProfileController@destroy` was removed. Users cannot self-delete.
- FINDING: No `is_active` check inside `RoleMiddleware`. The `InactiveUserTest` mid-session test passes for the `auth`-only `/profile` route, implying another mechanism handles it. Requires verification that `is_active` is also enforced on role-guarded routes (`admin/*`, `ustadz/*`).

### 3.2 Authorization Architecture

**Middleware:**

- FACT: All admin routes: `['auth', 'role:admin']`.
- FACT: All ustadz routes: `['auth', 'role:ustadz']`.
- FACT: Santri dashboard route: `['auth', 'role:santri']`.
- FACT: `RoleMiddleware` uses `UserRole::tryFrom()` — fail-closed for unknown roles.
- FACT: Profile route: `['auth']` only — correct by design.

**Policies:**

- FACT: `MateriPolicy`, `PenilaianPolicy`, `JadwalPolicy` all exist in `app/Policies/`.
- FACT: All three policies implement `before()` to grant Admin unrestricted access.
- FACT: `MateriController` uses `Gate::authorize('update', $materi)` in `edit`, `update`, and `destroy`.
- FINDING: `MateriController@index` does NOT call `Gate::authorize('viewAny', Materi::class)`. Not a security gap (route is behind `role:ustadz`), but a consistency gap.
- FINDING: `MateriController@store` does NOT call `Gate::authorize('create', Materi::class)`. Not a security gap, but a consistency gap.
- FACT: `PenilaianController@index` calls `Gate::authorize('viewAny', Penilaian::class)`.
- FACT: `PenilaianController@input` calls `Gate::authorize('create', Penilaian::class)`.
- FACT: `JadwalController@index` (Ustadz) calls `Gate::authorize('viewAny', Jadwal::class)`.
- FINDING: Policies use Laravel 11+ auto-discovery. No explicit `AuthServiceProvider` exists. Auto-discovery should work if model-policy naming conventions are followed (`Materi` → `MateriPolicy`). VERIFIED: tests pass, so discovery is functioning.

**FormRequest Authorization:**

- FACT: `StorePenilaianRequest::authorize()` — fully implemented. Checks `can('create', Penilaian::class)` AND validates all submitted `santri_id` values are in the Ustadz's valid `kelas` for the subject.
- FACT: `UpdateMateriRequest::authorize()` — fully implemented. Fetches materi and checks `can('update', $materi)`.
- FINDING: `StoreSantriRequest::authorize()` returns `true` unconditionally. Route is behind `role:admin` — not a security gap, but inconsistent.
- FINDING: Admin FormRequests (`StoreUstadzRequest`, `UpdateUstadzRequest`, `StoreJadwalRequest`, etc.) all likely return `true`. Admin-only routes contain the risk.

### 3.3 Database

**Foreign Keys and Delete Behavior:**

- FACT: `jadwals.user_id` → `users.id ON DELETE RESTRICT`. (changed from CASCADE)
- FACT: `materis.user_id` → `users.id ON DELETE RESTRICT`. (changed from CASCADE)
- FACT: `penilaians.user_id` → `users.id ON DELETE RESTRICT`. (changed from CASCADE)
- FACT: `penilaians.santri_id` → `santris.id ON DELETE RESTRICT`. (changed from CASCADE)
- FACT: `santris.user_id` → `users.id ON DELETE RESTRICT, UNIQUE`. (new column)
- FACT: All subject FK references use ON DELETE RESTRICT.

**Indexes:**

- FACT: `users.role` has a single-column index (added in `add_role_to_users_table` migration).
- FACT: `santris.user_id` has a UNIQUE index (auto-created by FK + unique constraint).
- FACT: `penilaians` has a composite unique index `(santri_id, subject_id, user_id)` — prevents duplicate grading entries.
- FINDING: `santris.email` column has no unique constraint and no index. If retained, it should be constrained.

**Unresolved Schema Issues (P0-4):**

- FINDING: `jadwals.hari` is still a free-form string. ROADMAP P0-4 task "Constrain `hari` column" is NOT started.
- FINDING: No Academic Year / Semester modeling. ROADMAP P0-4 temporal scoping task is NOT started.
- FINDING: `santris.kelas` and `jadwals.kelas` are still free-form strings. P0-4 `kelas` evaluation task is NOT started. (By design — no premature normalization, but the evaluation itself should happen.)

### 3.4 Authentication

**Login Flow:**

- FACT: `AuthenticatedSessionController@store` checks `is_active`, then resolves `dashboardRouteName()`, then redirects.
- FACT: `UserRole::Santri->dashboardRouteName()` returns `'santri.dashboard'`. Santri users who log in are redirected to `/santri/dashboard`.
- FINDING (REGRESSION): The `santri.dashboard` route renders `Inertia::render('Santri/Dashboard')`. No `resources/js/Pages/Santri/Dashboard.jsx` exists. A Santri login will produce a Vite manifest 500 error. This regression was introduced when P0-1B.4 completed `santri.dashboard` routing without creating the frontend stub.

**Password Reset:**

- FACT: All self-service reset routes (`/forgot-password`, `/reset-password/*`) return 404.
- FACT: `PUT /password` (authenticated self-service change) still works.

**Email Verification:**

- FACT: `verify-email` routes are absent from `routes/auth.php`.
- FACT: No email verification controllers exist in `app/Http/Controllers/Auth/`.
- FACT: `Auth/VerifyEmail.jsx` does not exist in `resources/js/Pages/Auth/`.
- FINDING: `email_verified_at` column remains in `users` schema and is reset on profile email change. Dead logic — low risk.

---

## 4. Test Baseline Audit

### 4.1 Summary

- FACT: 71 tests, 183 assertions, all passing (100%).
- Previous baseline per `CURRENT_STATE.md`: 38 tests. Suite has grown by 33 tests.

### 4.2 Test File Inventory

| Suite | File |
|-------|------|
| Auth | `AuthenticationTest.php`, `InactiveUserTest.php`, `PasswordConfirmationTest.php`, `PasswordResetTest.php`, `PasswordUpdateTest.php`, `RegistrationTest.php` |
| Admin | `DataIntegrityTest.php`, `SantriLifecycleTest.php`, `UstadzLifecycleTest.php`, `UstadzPasswordResetTest.php` |
| Feature | `ExampleTest.php`, `ProfileTest.php`, `RoleAccessTest.php` |
| Ustadz | `MateriSecurityTest.php`, `PenilaianSecurityTest.php` |
| Unit | `ExampleTest.php`, `UserMassAssignmentTest.php`, `UserRoleTest.php` |

### 4.3 Security Coverage Assessment

| Security Boundary | Covered? |
|------------------|----------|
| Public registration disabled | YES — `RegistrationTest` |
| Self-service password reset disabled | YES — `PasswordResetTest` |
| Role-based access (guest/admin/ustadz/santri/unknown) | YES — `RoleAccessTest` |
| Inactive user login rejection | YES — `InactiveUserTest` |
| Inactive user mid-session termination | YES — `InactiveUserTest` |
| `role` not mass-assignable | YES — `UserMassAssignmentTest` |
| Admin deactivate/reactivate Ustadz | YES — `UstadzLifecycleTest` |
| Admin cannot delete Ustadz with academic records | YES — `UstadzLifecycleTest` |
| Admin can reset Ustadz password | YES — `UstadzLifecycleTest` |
| Santri cannot be deleted with penilaian records | YES — `DataIntegrityTest` |
| Ustadz cannot edit/update/delete another's Materi | YES — `MateriSecurityTest` |
| Ustadz cannot grade Santri outside their Jadwal | YES — `PenilaianSecurityTest` |
| `UserRole` enum contract | YES — `UserRoleTest` |

### 4.4 Missing Critical Regression Tests

| Missing Test | Priority | Rationale |
|---|---|---|
| Santri atomic provisioning — creates both User and Santri | HIGH | P0-1B.4 core feature, no test exists |
| Santri provisioning rollback on invalid email | HIGH | Transaction integrity not tested |
| Santri provisioning rollback on invalid NIS | HIGH | Transaction integrity not tested |
| Admin can reset Santri password | MEDIUM | Symmetric with Ustadz reset test |
| Santri `user_id` unique constraint enforcement | MEDIUM | FK constraint not integration-tested |
| `is_active` mid-session check on role-guarded routes | MEDIUM | Covered for auth-only route, not verified for admin/ustadz routes |
| Santri login redirects to non-existent frontend page | HIGH | Regression — Santri login currently causes 500 |
| Admin password reset for Admin accounts | LOW | No current admin-to-admin reset UI |
| `PenilaianPolicy::update` for Ustadz updating own Penilaian | MEDIUM | Not explicitly tested |

---

## 5. Route Inventory

### 5.1 Public Routes

| Route | Handler |
|-------|---------|
| `GET /` | Inline closure — renders `Welcome` |

### 5.2 Authentication Routes

| Route | Handler | Middleware |
|-------|---------|------------|
| `GET /login` | `AuthenticatedSessionController@create` | `guest` |
| `POST /login` | `AuthenticatedSessionController@store` | `guest` |
| `POST /logout` | `AuthenticatedSessionController@destroy` | `auth` |
| `GET /confirm-password` | `ConfirmablePasswordController@show` | `auth` |
| `POST /confirm-password` | `ConfirmablePasswordController@store` | `auth` |
| `PUT /password` | `PasswordController@update` | `auth` |
| `GET /profile` | `ProfileController@edit` | `auth` |
| `PATCH /profile` | `ProfileController@update` | `auth` |

### 5.3 Admin Routes (`auth + role:admin`)

| Route Name | Method | URI |
|-----------|--------|-----|
| `admin.dashboard` | GET | `/admin/dashboard` |
| `admin.ustadz.index` | GET | `/admin/ustadz` |
| `admin.ustadz.create` | GET | `/admin/ustadz/create` |
| `admin.ustadz.store` | POST | `/admin/ustadz` |
| `admin.ustadz.edit` | GET | `/admin/ustadz/{id}/edit` |
| `admin.ustadz.update` | PUT | `/admin/ustadz/{id}` |
| `admin.ustadz.reset-password` | POST | `/admin/ustadz/{id}/reset-password` |
| `admin.ustadz.deactivate` | POST | `/admin/ustadz/{id}/deactivate` |
| `admin.ustadz.reactivate` | POST | `/admin/ustadz/{id}/reactivate` |
| `admin.ustadz.destroy` | DELETE | `/admin/ustadz/{id}` |
| `admin.santri.index` | GET | `/admin/santri` |
| `admin.santri.create` | GET | `/admin/santri/create` |
| `admin.santri.store` | POST | `/admin/santri` |
| `admin.santri.edit` | GET | `/admin/santri/{id}/edit` |
| `admin.santri.update` | PUT | `/admin/santri/{id}` |
| `admin.santri.reset-password` | POST | `/admin/santri/{id}/reset-password` |
| `admin.santri.destroy` | DELETE | `/admin/santri/{id}` |
| `admin.mapel.index` | GET | `/admin/mapel` |
| `admin.mapel.create` | GET | `/admin/mapel/create` |
| `admin.mapel.store` | POST | `/admin/mapel` |
| `admin.mapel.edit` | GET | `/admin/mapel/{id}/edit` |
| `admin.mapel.update` | PUT | `/admin/mapel/{id}` |
| `admin.mapel.destroy` | DELETE | `/admin/mapel/{id}` |
| `admin.jadwal.index` | GET | `/admin/jadwal` |
| `admin.jadwal.create` | GET | `/admin/jadwal/create` |
| `admin.jadwal.store` | POST | `/admin/jadwal` |
| `admin.jadwal.edit` | GET | `/admin/jadwal/{id}/edit` |
| `admin.jadwal.update` | PUT | `/admin/jadwal/{id}` |
| `admin.jadwal.destroy` | DELETE | `/admin/jadwal/{id}` |

### 5.4 Ustadz Routes (`auth + role:ustadz`)

| Route Name | Method | URI |
|-----------|--------|-----|
| `ustadz.dashboard` | GET | `/ustadz/dashboard` |
| `ustadz.jadwal.index` | GET | `/ustadz/jadwal` |
| `ustadz.santri.index` | GET | `/ustadz/santri` |
| `ustadz.santri.detail` | GET | `/ustadz/santri/{id}/detail` |
| `ustadz.penilaian.index` | GET | `/ustadz/penilaian` |
| `ustadz.penilaian.input` | GET | `/ustadz/penilaian/{id}/input` |
| `ustadz.penilaian.store` | POST | `/ustadz/penilaian/{id}` |
| `ustadz.materi.index` | GET | `/ustadz/materi` |
| `ustadz.materi.create` | GET | `/ustadz/materi/create` |
| `ustadz.materi.store` | POST | `/ustadz/materi` |
| `ustadz.materi.edit` | GET | `/ustadz/materi/{id}/edit` |
| `ustadz.materi.update` | PUT | `/ustadz/materi/{id}` |
| `ustadz.materi.destroy` | DELETE | `/ustadz/materi/{id}` |

### 5.5 Santri Routes (`auth + role:santri`)

| Route Name | Method | URI |
|-----------|--------|-----|
| `santri.dashboard` | GET | `/santri/dashboard` |

### 5.6 Orphan Routes, Dead Controllers, Dead Views

| Issue | Detail |
|-------|--------|
| STUB ROUTE — BROKEN | `santri.dashboard` renders `Santri/Dashboard` via Inertia. No `resources/js/Pages/Santri/Dashboard.jsx` exists. Will cause a 500 error on every Santri login. |
| Dead auth controller | `Auth/RegisteredUserController.php` — confirmed deleted. |
| Dead frontend page | `resources/js/Pages/Auth/Register.jsx` — confirmed deleted. |
| No dead controllers | All controllers referenced in routes exist on disk. |
| Missing Admin-Penilaian routes | PRD states Admins can review aggregate grades. No Admin routes for Penilaian or Materi viewing exist. By design (deferred). |

---

## 6. Production Readiness Assessment

### 6.1 Security Readiness

| Area | Status | Evidence |
|------|--------|----------|
| Public registration disabled | FACT: SECURE | Routes return 404, tested |
| Self-service password reset disabled | FACT: SECURE | Routes return 404, tested |
| Role-based middleware (vertical isolation) | FACT: SECURE | Fail-closed `RoleMiddleware` with enum validation |
| Horizontal privilege escalation (Materi ownership) | FACT: SECURE | `MateriPolicy`, `Gate::authorize`, tested |
| Horizontal privilege escalation (Penilaian grade injection) | FACT: SECURE | `StorePenilaianRequest::authorize()` validates Jadwal membership |
| Inactive user rejection | FACT: SECURE | Login-time check tested |
| Mass assignment protection on `role` | FACT: SECURE | `role` absent from `$fillable`, tested |
| FK cascade protection (RESTRICT) | FACT: SECURE | All academic FKs use RESTRICT |
| `is_active` mid-session enforcement on role-guarded routes | UNVERIFIED | Test passes for auth-only route. Mechanism for role-guarded routes not confirmed. |
| Santri login | FACT: BROKEN | No `Santri/Dashboard.jsx` — every Santri login causes Inertia 500 error |

### 6.2 Maintainability

| Area | Status |
|------|--------|
| Architecture documentation (`docs/references/`) | GOOD — detailed and accurate for most decisions |
| ROADMAP accuracy | POOR — significantly out of date; completed milestones marked deferred |
| CURRENT_STATE.md accuracy | POOR — route count, test count, Santri identity status all stale |
| Test suite | GOOD — 71 tests, meaningful security coverage; gaps remain |
| Code structure | GOOD — follows Laravel conventions, consistent patterns |
| Open schema decisions | MEDIUM RISK — `santris.email` column semantics unresolved |

### 6.3 Documentation Readiness

| Document | Required Action |
|----------|----------------|
| `docs/PRD.md` | Update Sections 6.1 and 6.2 — open questions 1 and 2 are resolved in code |
| `docs/CURRENT_STATE.md` | Significant update needed: route count, test count, Santri identity, feature matrix |
| `docs/DESIGN.md` | Update Section 3.2 — `dashboardRouteName()` for Santri now returns `'santri.dashboard'` not null |
| `docs/ROADMAP.md` | Mark P0-1B.2+, P0-1B.3, P0-1B.4, P0-3 as `[COMPLETED]` |
| `README.md` | Remove WARNING about public registration defaulting to `ustadz` role |

---

## 7. Consolidated Findings

### CRITICAL — Block Activation of Santri Accounts

1. **Santri login causes 500 error.** `santri.dashboard` route renders `Santri/Dashboard` via Inertia. No `resources/js/Pages/Santri/` directory or `Dashboard.jsx` exists. Every Santri login will fail with a Vite manifest error. Must be resolved before any Santri account can log in.

### HIGH — Fix Before Starting P1 Feature Work

2. **ROADMAP is significantly stale.** P0-1B.2, P0-1B.3, P0-1B.4, P0-3 are all marked as deferred or incomplete despite being fully implemented and merged to `main`. Misleading for future contributors.

3. **CURRENT_STATE.md is stale.** Route count (28 vs. 52), test count (38 vs. 71), Santri identity status (missing vs. implemented), and feature matrix all need updating.

4. **Missing Santri atomic provisioning tests.** `SantriController@store` uses `DB::transaction` for atomic User+Santri creation. This critical path has no automated regression test.

### MEDIUM — Technical Debt

5. **`santris.email` column semantics unresolved.** Column exists in migration, populated by seeder, but not validated or written by `StoreSantriRequest`. No unique constraint or index. Needs formal resolution from `account_identity_architecture.md` Section S1 before P1-1.

6. **`is_active` mid-session enforcement on role-guarded routes unverified.** `InactiveUserTest` covers `GET /profile` (auth-only route). Not confirmed that `admin/*` and `ustadz/*` routes also enforce `is_active` mid-session.

7. **DESIGN.md Section 3.2 documents null for Santri dashboard route.** Now returns `'santri.dashboard'` — documentation gap.

8. **PRD Section 6, Q1 and Q2 open questions are resolved in code.** Should be closed or updated.

### LOW — Polish

9. **`implementation_plan.md` in repository root** is a completed AI planning artifact. Archive or delete.

10. **`IMPLEMENTATION_SUMMARY.md` and `MENU_CRUD_GUIDE.md`** are obsolete AI artifacts already flagged as stale. Archive or delete.

11. **`MateriController@store` and `MateriController@index`** lack explicit `Gate::authorize` calls. Not a security gap (route middleware is sufficient) but inconsistent with other policy-guarded methods.

12. **`email_verified_at`** column is set/reset in `ProfileController@update` with no email verification flow active. Dead logic.

13. **P0-4 tasks are all correctly unstarted.** `hari` column unconstrained, no academic period modeling, `kelas` free-form strings. These remain unstarted per roadmap phase ordering.

---

## 8. Recommended Immediate Actions (Before P1)

1. **Create `resources/js/Pages/Santri/Dashboard.jsx`** — minimal stub to prevent 500 errors on Santri login. (CRITICAL)
2. **Update `docs/ROADMAP.md`** — mark P0-1B.2+, P0-1B.3, P0-1B.4, P0-3 as `[COMPLETED]`. (HIGH)
3. **Update `docs/CURRENT_STATE.md`** — route count, test count, feature matrix, Santri identity. (HIGH)
4. **Add Santri atomic provisioning tests** covering success path, email rollback, and NIS rollback. (HIGH)
5. **Resolve `santris.email` semantics** — remove or rename the column before P1-1 Santri portal work begins. (MEDIUM)
6. **Verify `is_active` mid-session enforcement on role-guarded routes.** (MEDIUM)
7. **Archive `implementation_plan.md`, `IMPLEMENTATION_SUMMARY.md`, `MENU_CRUD_GUIDE.md`.** (LOW)

---

*This report was generated by automated code audit on 2026-09-13. No application code was modified during the audit.*

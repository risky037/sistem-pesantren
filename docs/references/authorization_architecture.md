# Authorization Architecture Audit (P0-3)

## 1. Current Authorization State

- **Role-Based Routing:** Authorization is heavily reliant on route-level middleware (`['auth', 'role:admin']`, `['auth', 'role:ustadz']`). This provides broad, controller-level isolation but lacks granular object-level boundaries.
- **Middleware Coverage:** All registered web routes in `routes/web.php` are correctly protected by `auth` and `role:*` middleware, except for standard Breeze authentication routes and the base `/profile` routes. The `RoleMiddleware` acts as a fail-closed gate using the `UserRole` enum.
- **FormRequest Authorization:** Every custom FormRequest class in `app/Http/Requests/*` (e.g., `StorePenilaianRequest`, `UpdateMateriRequest`) unconditionally returns `true` from the `authorize()` method, entirely bypassing request-level authorization logic.
- **Object-Level Authorization (Policies):** There are **zero** Laravel Policies defined in the repository. Resource ownership is currently enforced manually via query constraints (e.g., `where('user_id', Auth::id())`) within controller methods.

## 2. Security Findings

1. **Horizontal Privilege Escalation (Penilaian):** In `Ustadz\PenilaianController@store`, the controller accepts an array of grades. The `StorePenilaianRequest` only validates that `santri_id` exists in the database. The controller forcefully sets `user_id = Auth::id()` but **fails to verify if the Ustadz is actually assigned to teach that specific Santri (via `Jadwal` and `kelas`) for the given `subject_id`**. An authenticated Ustadz could potentially craft a POST request to arbitrarily alter grades for any Santri in any subject, provided they know the IDs.
2. **Missing Ownership Abstraction:** While `MateriController` correctly isolates records using `where('user_id', Auth::id())` in every method, this logic is duplicated across `index`, `edit`, `update`, and `destroy`. The lack of Laravel Policies means authorization logic is tightly coupled to Eloquent queries, increasing the risk of accidental exposure in future development.
3. **Bypassed Form Requests:** The unconditional `return true;` in all `FormRequest::authorize()` methods sets a dangerous precedent. While some endpoints only require the `role:*` middleware, others (like `StorePenilaianRequest` or `UpdateMateriRequest`) should leverage this method or Policies to verify resource ownership before validation occurs.

## 3. Threat Model

| Actor | Threat | Current Mitigation | Required Mitigation |
| :--- | :--- | :--- | :--- |
| **Ustadz** | Modify/delete another Ustadz's `Materi` | Query constraints (`where('user_id', Auth::id())`) | `MateriPolicy` |
| **Ustadz** | Submit grades for unassigned `Santri` | **None** | `PenilaianPolicy` + query validation |
| **Ustadz** | Access `Admin` or `Santri` routes | `RoleMiddleware` | Sufficient |
| **Santri** | Access `Admin` or `Ustadz` routes | `RoleMiddleware` | Sufficient |
| **Admin** | Modify `Penilaian` directly | Admin lacks routes for this | Sufficient (by design) |

## 4. Ownership Matrix

| Resource | Admin Access | Ustadz Access | Santri Access | Ownership Key |
| :--- | :--- | :--- | :--- | :--- |
| **User** | Full CRUD | Read-only (Self) | Read-only (Self) | N/A |
| **Santri (Master)** | Full CRUD | Read-only (Index/Detail) | Read-only (Self) | `santris.user_id` |
| **Subject (Mapel)**| Full CRUD | Read-only (via Jadwal) | Read-only | N/A (Global) |
| **Jadwal** | Full CRUD | Read-only (Self) | Read-only (Self) | `jadwals.user_id` |
| **Materi** | None (Currently) | Full CRUD (Self) | Read-only (Self) | `materis.user_id` |
| **Penilaian** | None (Currently) | Create/Update (Self) | Read-only (Self) | `penilaians.user_id` |

*Note: Santri access is theoretical pending P1-1 implementation. Admin currently has no UI to view/edit Materi or Penilaian.*

## 5. Policy Recommendation

To harden the architecture, Laravel Policies must be introduced for domain models.

### Models Requiring Policies:
1. **`MateriPolicy`**:
   - `viewAny`, `view`: True if `user_id` matches, or if Santri is enrolled in the `kelas`.
   - `create`: True if Ustadz.
   - `update`, `delete`: True ONLY if `$materi->user_id === $user->id`.
2. **`PenilaianPolicy`**:
   - `viewAny`, `view`: True if Ustadz (owner) or Santri (recipient).
   - `create`, `update`: True ONLY if the Ustadz is actively scheduled to teach the target `Santri` (via shared `kelas` in `Jadwal`).
   - `delete`: Restricted (grades should generally be immutable or require Admin override, but currently Ustadz just updates them).
3. **`JadwalPolicy`**:
   - `viewAny`, `view`: True if Ustadz (owner) or Santri (enrolled).
   - `create`, `update`, `delete`: True ONLY for Admin.

*Admin bypass: Policies should implement `before()` to grant Admins global view access where appropriate, though direct modification of academic records (Materi, Penilaian) should ideally remain the domain of the assigned Ustadz.*

## 6. Route Protection Review

- **`admin/*`**: Correctly protected by `['auth', 'role:admin']`.
- **`ustadz/*`**: Correctly protected by `['auth', 'role:ustadz']`.
- **`santri/*`**: Correctly protected by `['auth', 'role:santri']`.
- **`profile`**: Standard Breeze protection (`auth`).
- **Conclusion:** Route-level middleware is solid and fail-closed. The vulnerability lies exclusively in object-level (horizontal) boundaries within the Ustadz role.

## 7. Test Strategy

The test suite must be expanded to explicitly cover horizontal privilege escalation:
1. **Materi Policy Tests**:
   - Assert Ustadz A receives 403 when attempting to `PUT` or `DELETE` Ustadz B's `Materi`.
2. **Penilaian Security Tests (Critical)**:
   - Assert Ustadz A receives 403 (or validation failure) when attempting to `POST` a grade for a Santri not in their `Jadwal`.
   - Assert Ustadz A receives 403 when attempting to overwrite Ustadz B's `Penilaian`.
3. **Form Request Tests**:
   - Assert that malicious payloads injected into valid requests are rejected by `authorize()`.

## 8. Implementation Sequence

1. **Generate Policies**:
   - `php artisan make:policy MateriPolicy --model=Materi`
   - `php artisan make:policy PenilaianPolicy --model=Penilaian`
   - `php artisan make:policy JadwalPolicy --model=Jadwal`
2. **Implement Authorization Logic**:
   - Write ownership checks (`$model->user_id === $user->id`) in Policies.
   - Implement the `Jadwal` cross-check logic for `PenilaianPolicy@create`.
3. **Refactor Controllers**:
   - Replace explicit `where('user_id', Auth::id())` blocks with `$this->authorize('update', $materi)` (or equivalent `Gate::authorize()` in Laravel 11+) in `MateriController` and `PenilaianController`.
4. **Refactor Form Requests**:
   - Update `StorePenilaianRequest` and `UpdateMateriRequest` to either delegate to Policies or implement localized checks in their `authorize()` methods.
5. **Write Security Tests**:
   - Implement the tests defined in Section 7.

## 9. Deferred Decisions

- **Admin Oversight UI**: The PRD states Admins can review aggregate academic progress, but no routes or views exist for Admin to access `Penilaian` or `Materi`. Implementing these views (and the corresponding `view` Policy grants) is deferred to a future feature phase.
- **Santri Access**: Policies should be written to accommodate Santri `view` access, but the actual routes and controllers for the Santri portal remain deferred (P1-1).

---
**Status**: The implementation of this authorization hardening can proceed. It is a necessary prerequisite (P0-3) before continuing to feature development.

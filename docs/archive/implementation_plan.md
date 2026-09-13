# P0-3 Authorization Hardening Implementation Plan

This implementation plan focuses on addressing the horizontal privilege escalation vulnerabilities identified in the audit and introducing Laravel Policies for core academic models.

## User Review Required

> [!IMPORTANT]
> The approach to securing `Penilaian` creation ensures that Ustadz can only assign grades to Santri who are formally scheduled in their `Jadwal` for the given subject. If an Ustadz needs to grade a Santri not in their Jadwal, the Admin must first update the Jadwal to include that Santri's `kelas`.

## Proposed Changes

---
### Policies (New)

#### [NEW] [MateriPolicy.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Policies/MateriPolicy.php)
- Implement `before` to allow Admin unrestricted access (though Admin currently lacks Materi routes).
- Implement `view` to allow the owner (Ustadz) and enrolled Santri (future).
- Implement `create`, `update`, `delete` restricting actions to the Ustadz owner (`$materi->user_id === $user->id`).

#### [NEW] [PenilaianPolicy.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Policies/PenilaianPolicy.php)
- Implement `before` to allow Admin unrestricted access.
- Implement `view` for the owner (Ustadz) and graded Santri (future).
- Implement `update`, `delete` restricting actions to the Ustadz owner (`$penilaian->user_id === $user->id`). (Creation authorization will be handled at the FormRequest level for bulk submission).

#### [NEW] [JadwalPolicy.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Policies/JadwalPolicy.php)
- Implement `before` to allow Admin unrestricted access.
- Implement `view` for the assigned Ustadz (`$jadwal->user_id === $user->id`) and enrolled Santri (future).
- Implement `create`, `update`, `delete` returning `false` (enforcing that only Admin, via `before`, can mutate schedules).

---
### Requests (Modified)

#### [MODIFY] [StorePenilaianRequest.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Requests/StorePenilaianRequest.php)
- Update `authorize()` to prevent horizontal privilege escalation.
- **Logic:** For the given `$subjectId`, look up all `kelas` this Ustadz teaches in `Jadwal`. Verify that every submitted `santri_id` is enrolled in one of those valid `kelas`. Reject the request if any Santri is unrelated.

#### [MODIFY] [UpdateMateriRequest.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Requests/UpdateMateriRequest.php)
- Update `authorize()` to explicitly check `$this->user()->can('update', $materi)` where `$materi` is fetched from the route parameter.

---
### Controllers (Modified)

#### [MODIFY] [Ustadz/MateriController.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Ustadz/MateriController.php)
- `edit`, `update`, `destroy`: Remove the manual `where('user_id', Auth::id())` clause.
- Replace it with `$this->authorize('update', $materi)` (or `delete`) to utilize the new `MateriPolicy`.

#### [MODIFY] [Ustadz/PenilaianController.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/app/Http/Controllers/Ustadz/PenilaianController.php)
- The manual `where('user_id', Auth::id())` filters in `index` and `input` queries will remain as they effectively scope the view layer, but `PenilaianPolicy` adds an additional layer of defense.

---
### Tests (New)

#### [NEW] [Tests/Feature/Ustadz/PenilaianSecurityTest.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/tests/Feature/Ustadz/PenilaianSecurityTest.php)
- Assert Ustadz cannot submit grades for a Santri not in their Jadwal (receives 403).
- Assert Ustadz cannot overwrite existing grades owned by another Ustadz.

#### [NEW] [Tests/Feature/Ustadz/MateriSecurityTest.php](file:///home/adminfid/Documents/Projects/sistem-pesantren/tests/Feature/Ustadz/MateriSecurityTest.php)
- Assert Ustadz receives 403 when trying to edit/update/delete another Ustadz's Materi.

## Verification Plan

### Automated Tests
- Run `php artisan test --filter=SecurityTest` to verify the new security boundaries.
- Run `php artisan test` to ensure no existing role boundary tests are broken.
- Run `vendor/bin/pint --test` to ensure code style compliance.
- Run `npm run build` to verify frontend compilation (though no JS changes are expected).

### Manual Verification
- Review `git diff --check` to ensure no trailing whitespace.
- Execute the git diff classification requested by the user.

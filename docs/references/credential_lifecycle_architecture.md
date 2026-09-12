# P0-1B.5 Credential Lifecycle Hardening Architecture

## 1. Current State
- **Self-Service Reset**: Public `forgot-password` and `reset-password` routes were previously removed. The system no longer relies on self-service email-based password resets.
- **Admin Reset (Ustadz)**: `UstadzController` has a dedicated `resetPassword` method and a separate UI section in `Admin/Ustadz/Edit.jsx` (which includes password confirmation). However, the main `UstadzController@update` also allows updating the password, leading to duplicated and inconsistent logic.
- **Admin Reset (Santri)**: `SantriController` lacks a dedicated reset password endpoint. Passwords can only be updated via the main edit form, which notably lacks a `password_confirmation` field, creating a risk of Admin typos locking out Santri.
- **Email Verification**: Laravel Breeze's default email verification routes, controllers, and views are still present, but the `verified` middleware is not used anywhere, and there is a strict "no SMTP" requirement.
- **Authenticated Password Change**: `PUT /password` allows authenticated users to change their known password (requires current password).

## 2. Security Findings
1. **Typo Risk (Santri)**: Missing `password_confirmation` in the Santri Edit form can easily lead to Admin typos, locking out Santri accounts indefinitely since self-service reset is disabled.
2. **Duplicated Reset Logic (Ustadz)**: `UstadzController` updates passwords in both `update` and `resetPassword` methods. The UI also has two password inputs on the same page.
3. **Dead Code (Email Verification)**: The presence of `verify-email` routes and controllers creates false expectations of email capability and expands the attack surface needlessly, given the "no SMTP" constraint.

## 3. Architecture Decision
- **Admin-Managed Reset**: Standardize Admin password resets across all roles (Ustadz, Santri) to use a dedicated "Reset Password" UI component that requires `password` and `password_confirmation`. Remove password fields from the main profile edit forms.
- **Email Verification**: Completely purge all email verification routes, controllers, and UI components. The system is institutionally managed and will not use SMTP.
- **Self-Service Change**: Retain the authenticated `PUT /password` flow (requiring `current_password`) so users can securely change their own passwords after logging in.

## 4. Proposed Changes

### Remove Email Verification Surface
- Delete `App\Http\Controllers\Auth\VerifyEmailController.php`
- Delete `App\Http\Controllers\Auth\EmailVerificationPromptController.php`
- Delete `App\Http\Controllers\Auth\EmailVerificationNotificationController.php`
- Remove `MustVerifyEmail` interface implementation from `User` model (if present).
- Remove `mustVerifyEmail` props from `ProfileController` and `Profile/Edit.jsx`.
- Delete `resources/js/Pages/Auth/VerifyEmail.jsx`.

### Standardize Admin Password Reset
- **Controllers**:
  - Keep `UstadzController@resetPassword`.
  - Add `SantriController@resetPassword`.
  - Remove password update logic from `UstadzController@update` and `SantriController@update`.
- **Form Requests**:
  - Add `ResetUserPasswordRequest` usage (or create specific ones) to validate `password` and `password_confirmation`.
  - Remove `password` validation from `UpdateSantriRequest` and `UpdateUstadzRequest`.
- **UI**:
  - Remove the password field from the main form in `Admin/Santri/Edit.jsx` and `Admin/Ustadz/Edit.jsx`.
  - Add the dedicated "Reset Password" section (like the one currently in Ustadz) to `Admin/Santri/Edit.jsx`.

## 5. Database Impact
- None. (The `users.email_verified_at` column can remain as a vestige, or be ignored. Modifying migrations for existing columns is unnecessary overhead).

## 6. Route Changes
**Remove**:
- `GET /verify-email`
- `GET /verify-email/{id}/{hash}`
- `POST /email/verification-notification`

**Add**:
- `POST /admin/santri/{id}/reset-password` (points to `SantriController@resetPassword`)

## 7. Controller Changes
- `Admin/SantriController`: Add `resetPassword` method. Remove password logic from `update`.
- `Admin/UstadzController`: Remove password logic from `update`.
- `Auth/` Verification controllers: Delete.

## 8. Frontend Changes
- `Profile/Edit.jsx`: Remove `mustVerifyEmail` logic.
- `Admin/Santri/Edit.jsx`: Add Reset Password section (with SweetAlert confirmation), remove password from main form.
- `Admin/Ustadz/Edit.jsx`: Remove password from main form.

## 9. Test Strategy
- Delete `EmailVerificationTest.php`.
- Add tests in `SantriLifecycleTest.php` and `UstadzLifecycleTest.php` to verify:
  - Admin can reset password successfully (with confirmation).
  - Admin cannot update password via the main `update` endpoint anymore.
- Verify authenticated users can still use `PUT /password`.

## 10. Migration Strategy
No database migrations required.

## 11. Deferred Decisions
- "Must change password on first login" is deferred to a future authorization hardening milestone.
- Comprehensive audit logging is deferred.

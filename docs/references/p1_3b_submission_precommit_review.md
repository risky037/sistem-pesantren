# P1-3B Implementation Security Cleanup Review

This document summarizes the security hardening and cleanup applied to the P1-3B Submission Foundation implementation prior to commit.

## 1. Removed Direct Trust of Request `assignment_id`
- **Issue**: `Santri\SubmissionController@store` was previously trusting the `assignment_id` provided in the request payload.
- **Resolution**: Updated the route to `POST /assignments/{assignment}/submissions`. The `SubmissionController` and `StoreSubmissionRequest` now resolve the `Assignment` model directly from the route context, completely ignoring any injected payload IDs.

## 2. Active Academic Period Validation in Policy
- **Issue**: Draft updates and submissions lacked an explicit check for an active academic period at the policy level.
- **Resolution**: Updated `SubmissionPolicy@update` and `SubmissionPolicy@submit` to strictly verify that `$submission->assignment->academicPeriod->is_active` is true. Draft submissions belonging to inactive academic periods can no longer be updated or submitted.

## 3. Replaced Manual `abort(403)` with Gate Authorization
- **Issue**: `Ustadz\SubmissionController@index` used a manual `if` condition to verify assignment ownership.
- **Resolution**: Replaced the manual check with `Gate::authorize('view', $assignment)`, centralizing authorization rules inside the `AssignmentPolicy` as per project standards.

## 4. Hardened `StoreSubmissionRequest` Authorization
- **Issue**: The `authorize()` method simply returned `true`.
- **Resolution**: Added strict role validation: `return $this->user()->role === 'santri' && $this->user()->santri !== null;`. This ensures only authenticated users with a valid santri profile can execute the request.

## 5. Added Missing Regression Tests
- Confirmed coverage for preventing updates to submitted assignments (`test_submitted_cannot_update`).
- Confirmed coverage for preventing re-submission of already submitted assignments (`test_submitted_cannot_submit_again`).
- Added tests asserting that a draft submission's update (`test_draft_cannot_update_if_academic_period_inactive`) and submit (`test_draft_cannot_submit_if_academic_period_inactive`) actions are strictly blocked if the assignment's academic period becomes inactive.
- Updated store route tests to align with the new `{assignment}` route parameter format.

## 6. Laravel Accessor Convention for `isLate`
- **Issue**: The `isLate()` method on the `Submission` model was a standard public boolean method.
- **Resolution**: Converted it to a Laravel `Attribute` accessor (`protected function isLate(): Attribute`), adhering to modern Eloquent conventions.

All automated tests, static analysis (`pint`), and front-end builds passed successfully following these changes. No architecture boundaries were altered.

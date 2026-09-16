# P1-3B Submission Foundation Walkthrough

This document summarizes the implementation of the P1-3B Submission Foundation for the Sistem Pesantren LMS.

## Migration
- Created the `submissions` table to store assignment submissions.
- Included `assignment_id` and `santri_id` with `ON DELETE RESTRICT` constraints to prevent orphaned records.
- Added a unique composite index on `['assignment_id', 'santri_id']` to ensure a santri can only submit once per assignment.
- `submitted_at` is nullable to distinguish between drafts and submitted states.
- The `isLate()` state is derived dynamically in the `Submission` model (`submitted_at > assignment.due_date`) and is not stored in the database.

## Lifecycle
- **Draft to Submitted**: Handled exclusively by the `submit` action in the `Santri/SubmissionController`.
- **State Machine Rules Enforced**: 
  - A draft can be updated.
  - A submitted submission can no longer be updated.
  - A submitted submission cannot be submitted again.
- Clients are prevented from directly setting or altering the `status` field via generic update requests (`UpdateSubmissionRequest` only accepts `content`).

## Authorization
- Implemented `SubmissionPolicy` to define strict access control.
- **Admin**: Has full access (`before()` method intercepts and grants all).
- **Santri**: Can only view, update, and submit their *own* submissions. They are strictly blocked from interacting with other santris' submissions.
- **Ustadz**: Can only view submissions that belong to assignments they created. Cross-ownership access is prohibited.

## Security Boundaries
- **Payload Injection Prevention**: `StoreSubmissionRequest` strictly ignores `santri_id` and `academic_period_id` from the payload. The controller securely derives `santri_id` from the authenticated user's `Santri` relationship, and `academic_period_id` is inherited from the referenced `Assignment`.
- **Assignment Validation**: Submissions can only be created if:
  - The assignment exists.
  - The assignment belongs to an active academic period.
  - The assignment is open (`status === 'open'`).
  - The assignment's `kelas` matches the authenticated santri's `kelas`.

## Tests
Created comprehensive feature tests ensuring all boundaries and lifecycle rules are enforced:
- **Santri Submission Tests (`tests/Feature/Santri/SubmissionTest.php`)**:
  - Validates class boundaries (cannot submit to another class).
  - Validates academic period constraints (cannot submit to an inactive period).
  - Ensures payload injection of `santri_id` fails and relies on auth context.
  - Prevents duplicate submissions.
  - Ensures the draft -> submitted lifecycle (drafts can be updated/submitted, submitted cannot be updated/resubmitted).
  - Validates cross-santri access is forbidden.
- **Ustadz Access Tests (`tests/Feature/Ustadz/SubmissionAccessTest.php`)**:
  - Ensures an Ustadz can view submissions for their assignments.
  - Ensures an Ustadz is forbidden from viewing submissions for another Ustadz's assignments.

All tests passed successfully, verifying the integrity and security of the implemented logic.

# P1-3B Submission Foundation Architecture

**Date:** 2026-09-16
**Status:** PROPOSED — Pending Stakeholder Approval
**Scope:** Architecture analysis and design for P1-3B Submission Foundation. No implementation will occur until this document is approved.

---

## 1. Domain Purpose

The LMS domain strictly separates the teacher's task definition from the student's work product.

- **Assignment:** The "teacher-created academic activity" (e.g., instructions, due dates, requirements).
- **Submission:** The "student-generated response artifact". It represents the operational evidence of a Santri's work for a specific assignment.

**Critical Boundary:** Submission scoring must NOT be merged with official `Penilaian` records. A submission score is an operational assessment of a single artifact. `Penilaian` represents the official, terminal grade components (Tugas, UTS, UAS) for an academic period. The bridge between these two domains is deferred to future grading workflows (P1-5/P1-6).

## 2. Database Design Review

### Proposed `submissions` Table

| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PRIMARY KEY | Unique identifier |
| `assignment_id` | BIGINT UNSIGNED | NOT NULL, FK | Reference to parent assignment |
| `santri_id` | BIGINT UNSIGNED | NOT NULL, FK | Reference to submitting santri |
| `content` | TEXT | NULLABLE | The student-generated text response |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | Lifecycle state |
| `submitted_at` | DATETIME | NULLABLE | Timestamp of actual submission |
| `created_at` | TIMESTAMP | | Standard Laravel timestamps |
| `updated_at` | TIMESTAMP | | Standard Laravel timestamps |

**Constraints:**
- `UNIQUE (assignment_id, santri_id)`: A Santri may only have one submission per assignment.

**Explicit Exclusions:**
No additional fields are needed for P1-3B. The following are explicitly excluded:
- File upload (`file_path`, `original_name`)
- Attachments
- Grading workflow (`score`, `graded_by`, `graded_at`)
- Feedback system (`ustadz_notes`)

## 3. Lifecycle Design

The submission lifecycle follows a strict, linear progression: `draft` ➔ `submitted` ➔ `graded`.

- **`draft`:** The initial state. Editable by the owner (Santri). Not visible for Ustadz review.
- **`submitted`:** The finalized state. It is immutable to the Santri. Visible to the Ustadz for review.
- **`graded`:** A placeholder for future preparation only. Not functionally used in P1-3B.

**Excluded States:**
We do not introduce `approved`, `rejected`, or `published` (these belong to future workflows or different domains).

**The `late` Status is Excluded:**
`late` is not a discrete status. Lateness is a temporal condition derived dynamically:
`is_late = submitted_at > assignment.due_date`
Storing `late` as a status would require background jobs to transition states when deadlines pass, introducing speculative infrastructure and race conditions.

## 4. Authorization Architecture

`SubmissionPolicy` governs all access and mutations.

### Santri Permissions
**Allowed:**
- Create their own submission.
- View their own submission.
- Update a submission while it is in the `draft` state.
- Submit their own `draft` submission (transition to `submitted`).

**Denied:**
- Modify a submission that is in the `submitted` state.
- Access or view another Santri's submission.
- Choose or manipulate the `santri_id` manually during creation or update.

### Ustadz Permissions
**Allowed:**
- View submissions for assignments they own (where `assignment.ustadz_id === user.id`).

**Denied:**
- View submissions for assignments owned by another Ustadz.

### Admin Permissions
- **Admin:** Granted full access via the `before()` method in `SubmissionPolicy`. However, there will be **no Admin UI** built for submissions in P1-3B. Admins manage data purely at the policy/database level.

## 5. Injection Prevention Rules

Controllers and FormRequests must aggressively prevent ID spoofing and parameter injection.

**The request must NEVER trust input for:**
- `santri_id` (a student could submit on behalf of another).
- `assignment_id` ownership (a student could submit to an assignment they don't have access to).
- `academic_period_id` (a user could alter historical data).

**The Server MUST resolve:**
- **`santri_id`:** Resolved strictly from the authenticated session: `$request->user()->santri->id`.
- **`academic_period_id`:** Resolved strictly via `AcademicPeriod::requireActive()`.
- **Assignment Ownership/Access:** Validated via `SubmissionPolicy` and `StoreSubmissionRequest::authorize()`.

## 6. Academic Period Boundary

The temporal boundary ensures historical data integrity.

**Submission Rules:**
- **Can Santri submit to:** Active period assignments ONLY. An assignment must belong to the active period and its status must be `open` to receive submissions.
- **Can Santri view:** Their own historical submissions. Yes, Santri may view past submissions across periods, scoped exclusively to their own `santri_id` (read-only).

This is consistent with the existing Santri portal design, where historical read access is permitted but write access requires the active period context.

## 7. Request Validation Design

FormRequests should focus on input sanitization and presence, deferring complex business logic to policies.

**`StoreSubmissionRequest`:**
- **Responsibilities:** Validates that `assignment_id` is present and valid. Validates that `content` meets string length constraints.
- **Authorization:** `authorize()` must verify the assignment is `open`, belongs to the active academic period, and matches the authenticated Santri's `kelas`.

**`UpdateSubmissionRequest`:**
- **Responsibilities:** Validates `content` and `status` (for the draft ➔ submitted transition).
- **Authorization:** `authorize()` defers to `SubmissionPolicy::update`, which ensures the submission belongs to the Santri and is currently a `draft`.

## 8. Controller Responsibility

Controllers must remain thin, orchestrating data retrieval and workflow execution while delegating authorization to the Policy layer.

**Santri Submission Controller:**
- Handles `store` (upsert behavior using `updateOrCreate`) and `update`.
- Injects the authenticated `santri_id`.
- Executes status transitions (setting `submitted_at` when status becomes `submitted`).

**Ustadz Submission Controller:**
- Handles `index` (listing submissions for a specific assignment) and `show`.
- Ensures the requested assignment is owned by the authenticated Ustadz via `AssignmentPolicy::view`.

**Rule of Thumb:**
- Policy = Authorization (Can they do this?)
- Controller = Data retrieval and workflow execution (Do this).

## 9. Testing Strategy

Tests are part of the definition of done. The following security and boundary tests are required:

- **Ownership Boundary:** Santri cannot access, view, or update another santri's submission.
- **Assignment Boundary:** Santri cannot submit to an assignment intended for another `kelas`.
- **Temporal Boundary:** Santri cannot submit to an assignment belonging to an old (inactive) academic period.
- **Lifecycle Boundary:** A submission with `submitted` status cannot be edited or transitioned back to `draft`.
- **Injection Boundary:** `santri_id` spoofing via request payload is blocked and ignored.
- **Ustadz Boundary:** Ustadz cannot view submissions for another Ustadz's assignment.

## 10. Scope Boundary

The following features are **explicitly excluded** from P1-3B:
- File upload and attachments.
- Grading UI (Ustadz inputting scores).
- Grade synchronization between LMS and official records.
- `Penilaian` table updates.
- Grade publishing workflows.
- Attendance tracking based on submissions.
- Messaging or chat features.
- Notifications (email or in-app).

## 11. Migration Strategy

**Dependency:** The `submissions` table has a strict foreign key dependency on the `assignments` table. Therefore, the `assignments` table (from P1-3A) must exist first.

**Rollback Safety:**
- `ON DELETE CASCADE` from `assignments` ensures that if an assignment is deleted, its submissions are cleanly removed without leaving orphaned rows.
- `ON DELETE RESTRICT` from `santris` ensures a Santri record cannot be deleted if they have historical submissions, preserving academic history.

## 12. Architecture Risks

- **Authorization Leakage:** Failing to enforce the `kelas` match or period boundary in `StoreSubmissionRequest::authorize()` could allow a Santri to submit to an assignment they shouldn't see.
- **Lifecycle Inconsistency:** If the controller trusts a `status` update to `draft` for an already `submitted` record, the immutability rule is broken. `SubmissionPolicy::update` must enforce `draft`-only mutability.
- **Duplicate Academic Records:** Storing `score` or `grade` data in the `submissions` table without a clear boundary risks confusing it with official `Penilaian` records. Strict adherence to the Domain Purpose (§1) mitigates this.

**Implementation Readiness Assessment:**
This architecture review establishes the clear boundaries and safety rules necessary for P1-3B. No implementation (code, tests, or migrations) should happen until this architecture document is reviewed and approved by stakeholders.

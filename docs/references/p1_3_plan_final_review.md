# P1-3 LMS Implementation Plan: Final Review Summary

**Date:** 2026-09-16
**Status:** READY FOR APPROVAL

This document summarizes the final constraints and clarifications applied to `docs/references/p1_3_lms_implementation_plan.md` in preparation for implementation.

## 1. Admin Authorization Clarified
- Admin retains full, unrestricted functional access to all assignments and submissions via `AssignmentPolicy::before()` and `SubmissionPolicy::before()`.
- **UI Exclusion:** There is strictly no dedicated Admin LMS UI developed in P1-3. Admin assignment management is handled purely at the model/policy level.

## 2. Submission Lifecycle & Immutability
- **Submission Statuses:** `draft` | `submitted` | `graded`
- **Edit-After-Submit Behavior:** Once a submission is finalized (transitions to `submitted`), it becomes **immutable**. Santri may only update submissions while they are in the `draft` state.
- **Lateness:** Lateness is fully derived from `submitted_at > due_date` and is not stored as a status.

## 3. Ambiguities Removed
- **Grade Publishing:** All references to grade publishing and `penilaians.is_published` have been explicitly removed. This workflow is deferred to P1-6.
- **Penilaian Synchronization:** The LMS submission score is strictly decoupled from the official `penilaians` records. Any write path from `submissions.score` to `penilaians` is prohibited in P1-3 and deferred to P1-5.
- **Assignment Status Terminology:** Hardened to `draft` | `open` | `closed`. The term `published` is completely avoided to prevent semantic overlap.

## 4. Final Security Constraints Enforced
The following security boundaries are structurally enforced and integrated into the test plan:
1. **`academic_period_id` is always server-resolved:** The active period is resolved via `AcademicPeriod::requireActive()` and never accepted from user input payloads.
2. **`santri_id` is never accepted from request payload:** It is securely resolved from the authenticated session (`$request->user()->santri->id`).
3. **Assignment ownership is validated by policy:** `AssignmentPolicy` rigidly restricts Ustadz actions to their own assignments.
4. **Class visibility is enforced server-side:** Santri can only view and submit to assignments that strictly match their `kelas`.

---
**Next Steps:**
Awaiting stakeholder approval to proceed with P1-3A (Assignment Foundation) implementation.

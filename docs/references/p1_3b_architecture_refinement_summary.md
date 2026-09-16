# P1-3B Architecture Refinement Summary

**Date:** 2026-09-16
**Branch:** `feature/p1-3b-submission-architecture-review`
**Status:** REFINED

This document summarizes the targeted refinements applied to the P1-3B Submission Foundation Architecture (`docs/references/p1_3b_submission_architecture.md`).

## Applied Corrections

### 1. Foreign Key Deletion Strategy
- **Change:** Changed the `ON DELETE CASCADE` constraint on the `assignment_id` foreign key to `ON DELETE RESTRICT`.
- **Rationale:** This preserves historical submission records. If an assignment has received submissions, it can no longer be deleted.

### 2. Lifecycle Implementation Clarity
- **Change:** Clarified that P1-3B explicitly only implements the `draft` ➔ `submitted` transition. The `submitted` ➔ `graded` transition remains a future workflow.
- **Rationale:** Prevents scope creep. There will be no grading action, controller, or UI developed in P1-3B.

### 3. Status Transitions
- **Change:** Removed the ability to make arbitrary status changes via the request payload. A dedicated lifecycle action (e.g., a `submit` method on the controller) is required for the submit transition.
- **Rationale:** Enhances security and ensures the state machine cannot be bypassed or put into an invalid state by malicious payloads.

### 4. Controller Creation Strategy
- **Change:** Removed the direct recommendation to use `updateOrCreate`. Replaced it with a safe draft retrieval and update behavior that strictly respects immutability.
- **Rationale:** `updateOrCreate` could inadvertently bypass immutability checks on already-submitted records if not implemented with extreme caution. Direct retrieval and authorization checks are safer.

### 5. `kelas` Data Boundary
- **Change:** Added an explicit note that `submissions` do NOT store `kelas`. 
- **Rationale:** The class boundary is structurally inherited from the parent `Assignment`, preventing data duplication and drift.

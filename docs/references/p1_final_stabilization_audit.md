# P1 Final Stabilization Audit

**Date:** 2026-09-15
**Phase:** Post-P1-2 Stabilization

This document outlines the findings of the final stabilization audit for Phase 1 (Academic Period Integration & Santri Portal). No code changes were made during this audit.

## 1. Critical Findings

*   **Authorization Hole in `StorePenilaianRequest`:**
    *   **Location:** `app/Http/Requests/StorePenilaianRequest.php` (Line 32)
    *   **Issue:** The validation logic checking if an Ustadz teaches a specific class (`Jadwal::where(...)`) fails to filter by the active `academic_period_id`.
    *   **Impact:** An Ustadz who taught a class in a *previous* semester can submit grades for that class in the *current* semester, violating horizontal privilege boundaries.

*   **Missing Gate Authorization in Ustadz Controllers:**
    *   **Location:** `app/Http/Controllers/Ustadz/SantriController.php` (`index` and `detail` methods)
    *   **Issue:** Missing `Gate::authorize()` checks.
    *   **Impact:** Relies entirely on `RoleMiddleware` for protection. Lacks fine-grained policy control to ensure an Ustadz is only viewing Santri they actually teach.

*   **Inconsistent Authorization in Admin Controllers:**
    *   **Location:** `Admin/SantriController.php`, `Admin/JadwalController.php`, `Admin/SubjectController.php`, `Admin/UstadzController.php`
    *   **Issue:** Older Admin controllers lack explicit `Gate::authorize()` calls, whereas the newly added `AcademicPeriodController` properly uses them.
    *   **Impact:** Breaks defense-in-depth and creates inconsistent controller patterns.

## 2. Medium Findings

*   **Database Schema vs. Documentation Contradiction (Materi):**
    *   **Location:** `database/migrations/2026_06_15_000004_create_materis_table.php` vs `docs/references/p1_domain_decision_record.md`
    *   **Issue:** The ADR explicitly states that `materis.academic_period_id` should be a `Nullable FK, SET NULL` to support perennial materials. However, the migration implements it as `NOT NULL` (`constrained()->onDelete('restrict')`).
    *   **Impact:** Breaks the planned feature of cross-period reusable curriculum materials.

*   **Historical Grade Leakage in Ustadz Detail View:**
    *   **Location:** `app/Http/Controllers/Ustadz/SantriController.php` (Line 40)
    *   **Issue:** The `$penilaians` query in `detail()` does not filter by `academic_period_id`.
    *   **Impact:** Exposes all historical grades given by that Ustadz to the Santri. If the Ustadz boundary is strictly the *active* period, this is a data leakage violation.

## 3. Low Priority Cleanup (Documentation Drift)

*   **`CURRENT_STATE.md` is Outdated:**
    *   Section 6.2 falsely claims "Missing Academic Year & Semester Modeling".
    *   Section 3 lists the Santri portal as a "stub route" and unimplemented, even though P1-2 features are live.
*   **`ROADMAP.md` is Outdated:**
    *   Milestones P1-0, P1-1, and P1-2 are implemented but not marked as `[COMPLETED]`.

## 4. Recommended Next Milestones

Before proceeding to active LMS feature development (P1-3), the following steps are required:
1.  **P1-Final Bugfix Sprint:** Remediate the authorization gaps in `StorePenilaianRequest` and controllers. Correct the `materis` migration contradiction (either update the code to nullable, or update the ADR to reflect NOT NULL).
2.  **Documentation Sync:** Update `CURRENT_STATE.md` and `ROADMAP.md` to accurately reflect the completed P1 domain state.
3.  **LMS Database Design:** Design the `assignments` and `submissions` schema, ensuring they respect the newly introduced `academic_periods`.

## 5. LMS Readiness Assessment

**Status: Conditionally Ready.**

The structural foundation is solid. The temporal anchor (`academic_periods`) and Santri portal have been successfully integrated. However, the critical authorization leak in `StorePenilaianRequest` demonstrates that period-scoping is not yet foolproof. 

**Recommendation:** The system will be ready for the complexities of LMS Assignment tracking and Submissions (P1-3) *only after* the critical findings in Section 1 are patched.

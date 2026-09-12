# Development Roadmap

This roadmap establishes a recovery-first engineering plan for Sistem Pesantren. **Active LMS feature development is deferred until all P0 recovery and stabilization milestones are fully satisfied and verified.**

---

## Phase 0: Baseline Recovery & Institutional Security (P0)

*All P0 items must be resolved, audited, and tested before proceeding to new feature initiatives.*

```
P0-1 (Security & Provisioning) ──> P0-2 (Test Recovery) ──> P0-3 (Authorization Audit)
                                                                     │
P0-7 (Quality Baseline) <── P0-6 (UI Consistency) <── P0-5 (CRUD Audit) <── P0-4 (DB Integrity)
```

### P0-1: Security and Account Provisioning
*   **[COMPLETED] P0-1A: Mitigate Public Registration Risk:** The vulnerability where `users.role` defaults to `ustadz` has been removed, and public `/register` endpoints have been disabled.
*   **Administrative Provisioning:** Implement Admin-controlled provisioning workflows for institutional staff (Ustadz) and administrative accounts.
*   **Authentication Route Preservation:** Ensure core authentication workflows (Login, Password Reset, Email Verification, Session Management) remain intact and secure.

### P0-2: Test Baseline Recovery
*   **[COMPLETED] Route Contract Resolution:** Resolved the mismatch where default starter-kit tests expected a generic `route('dashboard')` by aligning assertions with role-specific routing (`ustadz.dashboard`, `admin.dashboard`).
*   **[COMPLETED] Test Suite Green Baseline:** The PHPUnit test suite now achieves a 100% passing rate.

### P0-3: Authorization Audit
*   **Policy Enforcement:** Create and register Laravel Policies for all core models (`Subject`, `Jadwal`, `Penilaian`, `Materi`).
*   **Privilege Boundary Verification:** Ensure Ustadz can only view and modify records tied to their assigned classes, subjects, and materials. Prevent horizontal and vertical privilege escalation across all endpoints.

### P0-4: Database and Domain Integrity
*   **Referential Integrity & Indexing:** Audit migrations to ensure proper foreign key constraints, cascading delete/nullify behaviors, and query-aware composite indexes.
*   **Domain Modeling Review:**
    *   Evaluate the free-form `kelas` string representation in `jadwals` and `santris`.
    *   Constrain the `hari` column (using PHP enums or string constraints; a database table is not required).
    *   Establish structural foundations for temporal scoping (**Academic Year** and **Semester**).
*   **Migration Execution:** Utilize the active development migration policy (direct migration edits and `php artisan migrate:fresh --seed`).

### P0-5: Existing CRUD Business-Logic Audit
*   **Persistence Verification:** Audit all Admin workflows (Ustadz, Santri, Mapel, Jadwal) and Ustadz workflows (Jadwal, Santri, Penilaian, Materi) to ensure data persists correctly to the database without stubs or mock fallbacks.
*   **Query Optimization:** Apply explicit eager loading (`with()`) on all relational queries to eliminate N+1 bottlenecks. Enforce pagination on all listing views.

### P0-6: Existing UI/UX Consistency Audit
*   **SweetAlert Standardization:** Standardize user-facing feedback by adopting SweetAlert2 across all CRUD workflows for success notifications, validation error alerts, and destructive-action confirmations.
*   **Pattern Cleanup:** Phase out ad-hoc flash banners and custom alerts in favor of shared feedback utilities.
*   **Layout Polish & Accessibility:** Refine responsive layouts, keyboard navigation, loading indicators, and empty states using existing Tailwind CSS components without introducing external libraries like shadcn/ui.

### P0-7: Quality Baseline and Verification
*   **Comprehensive Test Coverage:** Add automated feature tests covering all critical business workflows, validation rules, and authorization boundaries.
*   **Static & Build Checks:** Verify code formatting with Laravel Pint (`vendor/bin/pint --format agent`) and confirm error-free asset compilation (`npm run build`).

---

## Phase 1: Core Academic & Learning Platform (P1)

*Phase 1 commences strictly after Phase 0 sign-off.*

### P1-1: Santri Authenticated Portal Foundation
*   Formally design and implement the connection between student authentication identities (`users`) and academic student records (`santris`).
*   Establish Admin-provisioned credentials or secure onboarding for Santri.
*   Build the Santri authenticated layout, personal schedule viewer, and learning material download interface.

### P1-2: Assignment Domain
*   Model curriculum assignments tied to specific subjects, teachers, classes, and academic terms.
*   Define assignment parameters: instructions, submission deadlines, and file attachment support.

### P1-3: Flexible Question Model
*   Design a flexible data representation supporting both multiple-choice and essay question formats without premature schema complexity.

### P1-4: Santri Submissions
*   Build student submission interfaces supporting text responses and file uploads.
*   Implement submission lifecycle states (Draft, Submitted, Late, Graded).

### P1-5: Automatic and Manual Grading
*   Develop auto-evaluation logic for multiple-choice questions.
*   Build an evaluation interface for Ustadz to score essay submissions, provide qualitative feedback, and calculate aggregate grades.

### P1-6: Santri Score History
*   Implement a formalized grade release workflow for teachers.
*   Provide a student gradebook interface allowing Santri to track their academic evaluations over time.

> [!NOTE]
> Database tables and implementation details for Phase 1 items must be defined during their respective feature design phases, not prematurely specified during recovery.

---

## Phase 2: Operational Enhancements (P2+)

*Long-term administrative and operational capabilities.*

*   **P2-1:** Data export and import utilities (Excel/PDF reports for grades and schedules).
*   **P2-2:** Academic term archiving and automated student class promotion workflows.
*   **P2-3:** Attendance tracking for classes and boarding activities.
*   **P2-4:** Administrative audit logs and system activity monitoring.

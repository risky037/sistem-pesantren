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
*   **[COMPLETED] P0-1B.1: Typed Role Foundation & Consolidated Redirects:** Established `UserRole` backed enum, `User::roleEnum()`, centralized dashboard redirect routing (`admin.dashboard`, `ustadz.dashboard`), fail-closed authentication clearance for unsupported/Santri logins, and dual enum validation in `RoleMiddleware`.
*   **[COMPLETED] P0-1B.2: Credential Lifecycle:** Deprecated self-service password reset routes (all return 404). Admin-managed password reset implemented for both Ustadz and Santri accounts via dedicated Admin routes.
*   **[COMPLETED] P0-1B.3: Account Lifecycle:** `is_active` column added to `users` table. Inactive users are rejected at login and mid-session. Admin deactivate/reactivate workflows implemented for Ustadz accounts.
*   **[COMPLETED] P0-1B.4: Santri Identity Architecture:** `santris.user_id` foreign key (NOT NULL, UNIQUE, RESTRICT) implemented. Atomic Santri provisioning creates User and Santri records within a single `DB::transaction`. `User::santri()` hasOne and `Santri::user()` belongsTo relationships established.
*   **[COMPLETED] Administrative Provisioning:** Admin-controlled provisioning workflows implemented for Ustadz and Santri accounts. Email verification routes removed; account recovery is exclusively an Admin operation.

### P0-2: Test Baseline Recovery
*   **[COMPLETED] Route Contract Resolution:** Resolved the mismatch where default starter-kit tests expected a generic `route('dashboard')` by aligning assertions with role-specific routing (`ustadz.dashboard`, `admin.dashboard`).
*   **[COMPLETED] Test Suite Green Baseline:** The PHPUnit test suite now achieves a 100% passing rate.

### P0-3: Authorization Audit
*   **[COMPLETED] Policy Enforcement:** `MateriPolicy`, `PenilaianPolicy`, and `JadwalPolicy` created, registered via Laravel auto-discovery, and applied in controllers via `Gate::authorize()`. All policies implement `before()` to grant Admin unrestricted access.
*   **[COMPLETED] Privilege Boundary Verification:** `StorePenilaianRequest::authorize()` enforces Jadwal-membership validation, ensuring Ustadz can only submit grades for Santri in their assigned classes. `MateriPolicy` enforces ownership on edit, update, and delete. Horizontal and vertical privilege escalation prevented across all ustadz endpoints.

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

### [COMPLETED] P1-1: Santri Authenticated Portal Foundation
*   **[COMPLETED]** Formally design and implement the connection between student authentication identities (`users`) and academic student records (`santris`).
*   **[COMPLETED]** Establish Admin-provisioned credentials or secure onboarding for Santri.
*   **[COMPLETED]** Build the Santri authenticated layout, personal schedule viewer, and learning material download interface.

### [COMPLETED] P1-2: Assignment Domain
*   **[COMPLETED]** Model curriculum assignments tied to specific subjects, teachers, classes, and academic terms.
*   **[COMPLETED]** Define assignment parameters: instructions, submission deadlines, and file attachment support.

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

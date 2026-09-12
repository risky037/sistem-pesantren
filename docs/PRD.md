# Product Requirements Document (PRD)

## 1. Product Objective

Sistem Pesantren is an integrated institutional management and learning platform tailored for Islamic boarding schools (*pesantren*). The platform streamlines daily academic and administrative workflows for three primary actors: **Administrators**, **Ustadz (Teachers)**, and **Santri (Students)**.

The long-term vision encompasses progressive Learning Management System (LMS) capabilities (such as flexible assignments, automated multiple-choice grading, and essay evaluations). However, the immediate product focus is establishing an institutionally secure, reliable, and scalable foundation covering master data, scheduling, materials distribution, and grading.

---

## 2. Actors and Role Boundaries

| Actor | Institutional Responsibility | Primary Boundaries |
| :--- | :--- | :--- |
| **Admin** | Institutional oversight, system configuration, and master data management. | Provisions accounts, manages subjects, schedules, and santri records. Has broad administrative privileges but does not directly teach classes. |
| **Ustadz** | Academic instruction, curriculum delivery, and student assessment. | Accesses assigned classes, uploads learning materials, records assessments/grades, and interacts with students in their domain. Cannot modify global system configuration or other teachers' records. |
| **Santri** | Academic participation, learning material consumption, and assignment completion. | Accesses an authenticated student portal, views schedules, downloads study materials, submits assignments, and reviews published grades. Strictly read-only on administrative and grading configurations. |

---

## 3. Core Academic Workflows

### 3.1 Account & Identity Provisioning
*   **Administrative Provisioning:** Institutional accounts (Admin, Ustadz, and Santri) are created and managed by Administrators.
*   **Restricted Self-Registration:** Public self-registration for privileged roles (such as Ustadz or Admin) is prohibited. Any public account onboarding must be strictly controlled or disabled during baseline recovery.
*   **Authentication Flows:** Standard, secure authentication mechanisms—including credential login, session management, password resets, and verification—must be supported for all authenticated actors.

### 3.2 Master Data Management (Admin)
*   **Santri Master Data:** Maintain comprehensive student biographical and enrollment records.
*   **Ustadz Directory:** Manage teaching staff profiles and accounts.
*   **Subjects (*Mata Pelajaran*):** Define curriculum subjects, subject codes, and descriptions.
*   **Class Scheduling (*Jadwal Pelajaran*):** Schedule teaching sessions linking an Ustadz, Subject, Class/Group, Day, and Time slot.

### 3.3 Academic Period & Temporal Scoping
*   **Academic Periods:** Academic activities must be organized and scoped by **Academic Year** and **Semester**.
*   **Historical Integrity:** Grades, schedules, and materials from previous academic periods must remain archived and immutable, while active workflows operate within the current active term.

### 3.4 Learning Materials Workflow (Ustadz & Santri)
*   **Ustadz Uploads:** Teachers publish syllabus content, lecture notes, and document attachments targeted to specific classes and subjects.
*   **Santri Access:** Students browse and download materials relevant to their enrolled classes.

### 3.5 Assessment & Grading Workflow (Ustadz & Admin)
*   **Grade Recording:** Ustadz record numerical scores across designated assessment components (e.g., *Tugas*, *UTS*, *UAS*).
*   **Calculations & Validation:** Inputs must validate within defined numerical ranges (e.g., 0–100) with clear error feedback.
*   **Administrative Oversight:** Administrators can review aggregate academic progress across all classes and departments.

### 3.6 Future Assessment & LMS Workflows (Progressive Enhancement)
*   **Assessment Creation:** Ustadz create structured assignments with defined time limits, instructions, and due dates.
*   **Flexible Question Bank:** Support for multiple-choice questions (with automated answer evaluation) and essay questions (requiring manual teacher grading and feedback).
*   **Santri Submissions:** Students submit responses digitally with status tracking (Draft, Submitted, Late, Graded).
*   **Grade Release & Visibility:** Dedicated workflow for teachers to review submissions, finalize grades, and release results to student portals.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Scalability & Query Efficiency
*   **Institutional Scalability:** The application must comfortably support growing pesantren operations (hundreds of santri, dozens of ustadz, multi-year academic archives) without premature enterprise complexity.
*   **Pagination:** All potentially unbounded lists (Santri directory, Schedules, Grade lists, Materials, and Audit logs) must be paginated with standard page-size limits.
*   **Bounded Result Sets:** Unbounded database queries and collection dumps are strictly prohibited. All queries must enforce explicit bounds or filters.
*   **Eager Loading & N+1 Prevention:** All relational data queries must explicitly eager-load related models (e.g., `with(['subject', 'ustadz'])`) to prevent N+1 query bottlenecks.
*   **Query-Aware Database Indexing:** Database schema indexes must be defined based on verified query patterns—specifically foreign keys, composite filters (e.g., `[subject_id, kelas]`), and sorting fields.
*   **Bounded Inertia Props:** Inertia responses must transmit only the fields required by the active view component to prevent excessive JSON payload sizes.
*   **Pragmatic Infrastructure:** Do not introduce distributed microservices, message brokers, Kubernetes, or mandatory Redis caching until measurable performance telemetry demonstrates a clear need.

### 4.2 Security & Authorization
*   **Role-Based Access Control (RBAC):** Server-side authorization must be enforced via middleware and Laravel Policies on all routes and actions.
*   **Safe Defaults:** User creation must never default to privileged roles. Public self-registration must not grant elevated privileges.
*   **Request Validation:** All incoming state-changing requests must be validated strictly via Form Request classes.

### 4.3 User Interface, Accessibility & Consistency
*   **Preserve Visual Language:** Maintain and refine the existing Tailwind CSS design language. External UI component frameworks (such as shadcn/ui) must not be introduced without an explicit architectural decision.
*   **Reusable Component Architecture:** Maximize reuse of existing UI components (`resources/js/Components`) for forms, tables, modals, action buttons, and layout wrappers.
*   **Consistent Interaction Feedback:**
    *   **SweetAlert Integration:** Use SweetAlert as the standard shared interaction pattern for user-facing success alerts, error dialogues, action confirmations, and destructive-action verification.
    *   **Standardized States:** All interactive screens must feature predictable loading skeletons/spinners, empty states, and inline form validation errors.
*   **Responsive Layouts:** Interfaces must render correctly and predictably across desktop, tablet, and mobile viewports.
*   **Keyboard & Semantic Accessibility:** Forms and modal dialogues must support standard keyboard navigation (focus management, Escape to close, Enter to submit) and semantic HTML tags.

---

## 5. Non-Goals

*   **Microservices or Distributed Architecture:** The system is and will remain a modular Laravel + Inertia monolith.
*   **Speculative Abstractions:** Generic repository patterns, service layers, and unnecessary interfaces must not be introduced without demonstrable complexity justifications.
*   **UI Framework Rewrite:** No wholesale UI redesigns or migration away from the current Tailwind CSS styling foundation.
*   **Arbitrary Performance Benchmarks:** No invented concurrency figures or synthetic SLAs without real-world telemetry and load-testing data.
*   **Premature Complex Assessments in Recovery:** Advanced LMS assessment engines are out of scope during the initial stability and recovery phase.

---

## 6. Open Product Decisions Required

> [!IMPORTANT]
> The following institutional policy decisions must be formally finalized by stakeholders:
> 1.  **Public Registration Policy:** Confirm the complete deprecation or conditional restriction of public self-registration in favor of Admin-only provisioning.
> 2.  **Santri Authentication Contract:** Formally establish the relationship between authentication identities (`users`) and academic student records (`santris`) to enable student portal access.
> 3.  **Academic Period Scoping Model:** Define the institutional schedule for academic year transitions, student semester progression, and historical grade archiving.
> 4.  **Grading Scale & Passing Criteria:** Finalize the standardized grading scale, weighting rules (Tugas/UTS/UAS), and minimum passing scores (*KKM*).
> 5.  **Assessment Submission Policies:** Specify deadline enforcement rules, late submission penalties, and retry/resubmission limits for digital assessments.

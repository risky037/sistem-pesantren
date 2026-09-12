# Architecture & Design Guide

## 1. System Architecture Overview

Sistem Pesantren is structured as a modern monolithic web application using the **Laravel + Inertia.js + React** stack. 

*   **Backend Application:** Laravel 13 framework running on PHP 8.3+. Serves API/web controllers, manages data models, enforces authorization policies, and orchestrates database transactions.
*   **Client Interface:** Inertia.js v2 SPA bridge with React 18, avoiding separate client-side routing while delivering a reactive, single-page application user experience.
*   **Design System:** Vanilla Tailwind CSS with customized layout primitives and zero external component library overhead (no shadcn/ui).
*   **Interaction Standards:** SweetAlert2 for consistent user-facing feedback, alerts, confirmations, and destructive actions.

---

## 2. Migration & Database Lifecycle Policy

The project observes a distinct two-phase database migration strategy:

### 2.1 Active Development Phase (Current)
*   **Direct Migration Editing:** Existing migration files may be edited directly to correct columns, modify data types, or refine indexes.
*   **Fresh Migrations Permitted:** Running `php artisan migrate:fresh --seed` is acceptable and encouraged to maintain a clean schema.
*   **No Redundant Migrations:** Corrective migrations (e.g., `add_column_x_to_table_y`) should not be created merely to fix development mistakes unless a genuinely new domain table or historical tracking requirement exists.

### 2.2 Production Phase (Post-Deployment)
*   **Immutable Migrations:** Following the first production deployment, all historical migration files become strictly immutable.
*   **Forward-Only Migrations:** All subsequent schema modifications must be introduced through dedicated, forward-only migration scripts.

---

## 3. Account and Identity Architecture

### 3.1 Guiding Principles
*   **Authentication vs. Academic Records:** The `users` table strictly represents authentication identities, login credentials, and core authorization roles (`admin`, `ustadz`, and future `santri`).
*   **Administrative Provisioning:** Institutional accounts must be provisioned by Administrators unless formal product requirements later establish secure, verified self-registration workflows.
*   **No Privileged Self-Registration:** Public registration granting privileged access (such as `ustadz` or `admin`) is strictly prohibited.
*   **Santri Authentication Contract:** Santri must eventually possess an authenticated login identity to access the student portal. The current Santri domain record is not connected to an authentication identity, while the intended product requires Santri login. The relationship between authentication identity and academic Santri data therefore requires explicit design.
*   **Pragmatic Modeling:** Do **not** prematurely introduce separate profile tables (such as `santri_profiles` or `ustadz_profiles`) unless detailed domain modeling proves they are strictly required. Existing models (`User`, `Santri`) should be preserved, reused, or evolved pragmatically.

---

## 4. Academic Domain Architecture

Future domain evolution must explicitly account for the following core academic dimensions before implementing new features:

1.  **Academic Year & Semester:** All active academic entities (schedules, grades, materials, enrollments) must be temporally scoped to prevent historical data leakage.
2.  **Classes & Groups (`kelas`):** Structured domain representation to replace unstructured strings, supporting cohorts and grade levels without premature complexity.
3.  **Enrollment & Class Membership:** The formal assignment of a student to a class for a specific academic period.
4.  **Curriculum & Subjects (*Mata Pelajaran*):** Subject catalog linked to grade levels and departments.
5.  **Teaching Assignments & Schedules (*Jadwal Pelajaran*):** Relational bindings between teachers, classes, subjects, days, and time slots.
6.  **Assessments & Grading (*Penilaian*):** Score recording, evaluation rubrics, component weighting, and grade publishing.

> [!NOTE]
> Detailed implementation schemas for these concepts must not be prematurely coded until formal domain design tasks are approved.

---

## 5. Proportionate Institutional Scalability

Scalability for Sistem Pesantren means supporting growing institutional data volumes (hundreds of students, years of historical grades, numerous material uploads) without premature enterprise complexity.

### 5.1 What to Avoid (Anti-Patterns)
*   **No Microservices:** Maintain the monolithic Laravel structure.
*   **No Kubernetes or Distributed Orchestration:** Deploy as a single cohesive unit.
*   **No Message Brokers:** Do not introduce Kafka, RabbitMQ, etc.
*   **No Mandatory Redis:** Default to database/file drivers until measurable cache latency proves necessary.
*   **No Premature Abstraction Layers:** Do not mandate repository, service, or interface layers across every feature; use standard Eloquent models and controller queries.

### 5.2 Mandatory Engineering Practices
*   **Mandatory Pagination:** Paginate all growing lists (Santri directory, Jadwal, Penilaian, Materi, audit logs). Unbounded collection queries (`Model::all()`) are prohibited.
*   **Bounded Query Bounds:** Enforce query limits and server-side filtering on all listing endpoints.
*   **Explicit Eager Loading (N+1 Prevention):** Always eager-load relationships required by views using `with()` to eliminate N+1 query overhead.
*   **Query-Aware Database Indexing:** Add indexes to foreign keys and composite columns based on demonstrated query patterns (e.g., `where(['subject_id', 'kelas'])`).
*   **Foreign-Key Integrity:** Enforce referential integrity and cascading behaviors in database migrations.
*   **Lightweight Inertia Props:** Transmit only necessary model attributes to the frontend. Avoid serializing entire model hierarchies into page props.
*   **Manageable File Storage:** Store material uploads on disk using Laravel's Filesystem abstraction, storing only paths and metadata in the database.
*   **Justified Asynchronous Queues:** Queue long-running tasks (such as batch report generation or external notifications) only when genuinely necessary for request responsiveness.
*   **Data-Driven Caching:** Introduce caching mechanisms only when actual performance metrics identify an unambiguous bottleneck.

---

## 6. UI/UX Architecture & Interaction Standards

### 6.1 Design Language Preservation
*   **Preserve Tailwind Foundation:** Retain the current Tailwind CSS visual language, color palette, and component patterns.
*   **No External UI Frameworks:** Do not introduce shadcn/ui or other external component libraries without an explicit, approved product decision.
*   **No Unjustified Redesigns:** Do not rewrite or redesign existing working interfaces from scratch. Focus on incremental consistency and usability improvements.

### 6.2 Component Reuse & Standards
Future UI work must focus on consistency across the following facets:
*   **Forms:** Reusable form groups, inputs, select dropdowns, textareas, and clear inline validation error states.
*   **Tables:** Standardized table layouts with integrated pagination controls and sort indicators.
*   **Modals & Dialogs:** Accessible modal overlays with keyboard trap and focus restoration.
*   **States:** Consistent loading skeletons/spinners and informative empty states for lists with no records.
*   **Destructive Actions:** Clear confirmation dialogs prior to executing permanent record deletions.

### 6.3 SweetAlert2 Standard
*   **Standard Interaction Feedback:** SweetAlert2 is the confirmed, preferred interaction pattern for:
    1.  Success notifications following form submissions or state changes.
    2.  Error alerts and server validation feedback.
    3.  Confirmation dialogs for critical or destructive actions (e.g., record deletions).
*   **Gradual Harmonization:** Existing custom flash banners and ad-hoc notification popups should be systematically transitioned to shared SweetAlert helper utilities over the recovery roadmap.

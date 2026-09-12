# Current State & Technical Audit

## 1. Repository Baseline

*   **Language:** PHP `^8.3` *(Audited local development runtime: PHP 8.4.16)*
*   **Backend Framework:** Laravel `^13.8` *(Audited local runtime: Laravel 13.15.0)*
*   **Client Bridge:** Inertia.js v2 (`^2.0.0`) with React 18 (`^18.2.0`)
*   **Styling:** Tailwind CSS 3.4 (`^3.4.19`)
*   **Alerts & Interaction:** SweetAlert2 (`^11.26.25`)
*   **Database Strategy:**
    *   *Intended Production Deployment:* MySQL.
    *   *Local Development & Automated Testing:* SQLite (configured in `.env.example` and test runners).
*   **Status:** Active recovery and stabilization phase.

---

## 2. Route Inventory

The application defines 28 total registered web routes:

*   **Authentication Flow (Laravel Breeze):** Standard guest and auth endpoints (Login, Register, Forgot Password, Reset Password, Verify Email, Confirm Password, Logout).
*   **Administrative Management (`role:admin`, 16 routes):**
    *   Dashboard: `admin.dashboard` (`/admin/dashboard`)
    *   Ustadz Management: Resource routes for staff (`/admin/ustadz`)
    *   Santri Management: Resource routes for students (`/admin/santri`)
    *   Subject Management (*Mata Pelajaran*): Resource routes for curriculum subjects (`/admin/mapel`)
    *   Schedule Management (*Jadwal Pelajaran*): Resource routes for schedules (`/admin/jadwal`)
*   **Teaching & Academic Flow (`role:ustadz`, 10 routes):**
    *   Dashboard: `ustadz.dashboard` (`/ustadz/dashboard`)
    *   Schedule View: Index route (`/ustadz/jadwal`)
    *   Santri Directory: Index and Detail routes (`/ustadz/santri`, `/ustadz/santri/{id}`)
    *   Penilaian (Grading): Index, Input Form, and Store endpoints (`/ustadz/penilaian`, `/ustadz/penilaian/input`, `/ustadz/penilaian`)
    *   Materi (Learning Materials): Resource routes for curriculum uploads (`/ustadz/materi`)
*   **Student Flow (`role:santri`):** Currently missing. No routes or student-authenticated views exist in the repository.

---

## 3. Feature Matrix & Implementation Reality

| Module | Feature Area | Current Implementation Reality |
| :--- | :--- | :--- |
| **Authentication** | Registration & Onboarding | **Resolved (P0-1A):** Public registration is disabled. The database default role has been removed to prevent privilege escalation. |
| **Authentication** | Login & Password Flows | Functional. Starter-kit test suite updated to align with role-based routing contract. |
| **Admin** | Staff Management (Ustadz) | Implemented via `UserController` (`role = 'ustadz'`). Functional database CRUD. |
| **Admin** | Santri Management | Implemented via `SantriController`. Direct CRUD on `santris` table. |
| **Admin** | Subject Management (*Mapel*) | Implemented via `SubjectController`. Direct CRUD on `subjects` table. |
| **Admin** | Schedule Management (*Jadwal*) | Implemented via `JadwalController`. Connects `user_id`, `subject_id`, and string `kelas`. |
| **Ustadz** | Schedule Viewing | Implemented via `Ustadz\JadwalController`. Filtered by logged-in `user_id`. |
| **Ustadz** | Santri Browsing | Implemented via `Ustadz\SantriController`. Read-only views of santri master data. |
| **Ustadz** | Grading (*Penilaian*) | Implemented via `PenilaianController`. Form records scores tied to `user_id`, `santri_id`, and `subject_id`. |
| **Ustadz** | Materials (*Materi*) | Implemented via `MateriController`. File upload handling and metadata storage. |
| **Santri** | Student Portal | **Missing:** No authentication identity, portal layout, or self-service features. |

---

## 4. Security Risks

> [!NOTE]
> **Resolved (P0-1A): Unrestricted Public Registration to Privileged Role**
> The critical vulnerability where public registration created privileged Ustadz accounts has been eliminated.
> 1. Public `/register` endpoints have been removed.
> 2. The unsafe `ustadz` database default has been removed from the users migration, forcing explicit role provisioning.
> 3. Account creation is now correctly restricted to institutional provisioning.
>
> **Recommended Recovery Direction:**
> *   Disable public self-registration during the recovery phase.
> *   Require that all institutional accounts (Admin, Ustadz, and Santri) be provisioned exclusively by Administrators.
> *   Preserve existing core authentication endpoints (login, password reset, email verification, logout).

---

## 5. Account Model & Identity Findings

*   **Current Relationship:** The `User` model currently represents staff accounts (Admin and Ustadz). The `Santri` model represents academic student biographical records stored in an isolated `santris` table without any `user_id` foreign key.
*   **Domain Evaluation:**
    > "The current Santri domain record is not connected to an authentication identity, while the intended product requires Santri login. The relationship between authentication identity and academic Santri data therefore requires explicit design."
*   **Architectural Guidance:** Do not prematurely force separate profile tables (such as `santri_profiles` or `ustadz_profiles`) before the account-linkage model is formally designed and approved.

---

## 6. Domain Modeling Deficiencies

Repository evidence indicates that several core academic concepts are currently weakly modeled or lack structural constraints:

1.  **Free-Form Class Representation (`kelas`):**
    *   In the `jadwals` and `santris` tables, the class or group is stored as a free-form string (e.g., `'10-A'`, `'Kelas 7'`).
    *   *Problem:* Without structural constraints, typo variations (e.g., `'X-A'` vs `'10-A'`) cause fragmented queries and prevent reliable cohort reporting.
    *   *Architectural Guidance:* Describe the domain problem clearly before prescribing solutions; do not prematurely prescribe a dedicated `ClassModel` merely because `kelas` is currently a string.
2.  **Missing Academic Year & Semester Modeling:**
    *   The schema possesses no representation of an **Academic Year** (e.g., `2025/2026`) or **Semester** (Odd/Even).
    *   *Impact:* Academic data currently lacks clear temporal scoping. Grades in `penilaians`, schedules in `jadwals`, and files in `materis` accumulate indefinitely without temporal partition boundaries, preventing historical term archiving or term-based filtering.
3.  **Unconstrained Schedule Days (`hari`):**
    *   In the `jadwals` table, the day of the week is stored as a raw string (`$table->string('hari')`).
    *   *Impact:* Inconsistent values (e.g., `'Senin'` vs `'senin'` or abbreviations) can degrade query reliability.
    *   *Architectural Guidance:* Constraining this domain value is beneficial, but `hari` does NOT require a separate database table. A PHP enum or database string constraint is the appropriate lightweight representation.
4.  **Enrollment & Class Membership Ambiguity:**
    *   Santri records contain a static `kelas` string rather than an academic-period enrollment record. When a student progresses to the next grade level in a subsequent year, existing historical records risk loss of context. Enrollment lifecycle requires dedicated domain modeling during feature development.

---

## 7. Test Baseline & Route Contract Analysis

*   **Test Suite Status:** 25 tests currently pass (100%).
*   **Resolved Route Contract Mismatch (P0-1A):**
    *   Previously, failing tests (`PasswordConfirmationTest`, `RegistrationTest`, `EmailVerificationTest`) originated from the default Laravel Breeze starter-kit suite expecting a standard named route `route('dashboard')` after authentication actions.
    *   The test suite and application redirect controllers have been unified. Tests now properly assert against the intended role-based routing architecture (`route('ustadz.dashboard')` and `route('admin.dashboard')`).

---

## 8. UI Consistency Findings

*   **Design Language:** The application consistently leverages Tailwind CSS utility classes and maintains a cohesive visual identity across Admin and Ustadz layouts.
*   **SweetAlert Integration Reality:**
    *   SweetAlert2 is installed (`package.json`) and imported in several components (e.g., `sweetalert2.all.js`).
    *   *Inconsistency:* Usage is currently uneven across modules. Certain CRUD actions trigger SweetAlert dialogs for success and deletion confirmation, while other screens rely on custom inline flash banners, standard alert divs, or browser default behavior.
    *   *Classification:* This is a **UI/UX consistency and polish finding**, not a security vulnerability. Future recovery tasks should standardize SweetAlert across all forms and destructive actions without redesigning the UI from scratch.

---

## 9. Legacy Documentation Notice

> [!WARNING]
> **Outdated Documentation Files in Repository:**
> *   `IMPLEMENTATION_SUMMARY.md` claims that all backend models, controllers, and APIs are "Coming Soon" or that implementation is complete, which directly conflicts with actual codebase reality.
> *   `MENU_CRUD_GUIDE.md` reflects an unverified prior implementation guide with outdated assumptions.
> *   Both files are marked as **legacy and stale**. They must not be treated as ground truth during development.

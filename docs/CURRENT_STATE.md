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

The application defines 52 total registered web routes:

*   **Authentication Flow (Customized from Breeze):** Login, Confirm Password, Logout, Password Update (self-service). Public registration, forgot-password, reset-password, and verify-email routes have been removed.
*   **Administrative Management (`role:admin`, 29 routes):**
    *   Dashboard: `admin.dashboard` (`/admin/dashboard`)
    *   Ustadz Management: Full lifecycle routes including create, edit, deactivate, reactivate, reset-password, and delete (`/admin/ustadz`)
    *   Santri Management: Full lifecycle routes including create, edit, reset-password, and delete (`/admin/santri`)
    *   Subject Management (*Mata Pelajaran*): Resource routes for curriculum subjects (`/admin/mapel`)
    *   Schedule Management (*Jadwal Pelajaran*): Resource routes for schedules (`/admin/jadwal`)
*   **Teaching & Academic Flow (`role:ustadz`, 13 routes):**
    *   Dashboard: `ustadz.dashboard` (`/ustadz/dashboard`)
    *   Schedule View: Index route (`/ustadz/jadwal`)
    *   Santri Directory: Index and Detail routes (`/ustadz/santri`, `/ustadz/santri/{id}/detail`)
    *   Penilaian (Grading): Index, Input Form, and Store endpoints (`/ustadz/penilaian`)
    *   Materi (Learning Materials): Full resource routes for curriculum uploads (`/ustadz/materi`)
*   **Student Flow (`role:santri`, 1 route):** Stub dashboard (`/santri/dashboard`) exists for routing purposes. The corresponding frontend page is a known open item (no `Santri/Dashboard.jsx` exists yet).
*   **Profile Routes (auth):** `GET /profile`, `PATCH /profile`

---

## 3. Feature Matrix & Implementation Reality

| Module | Feature Area | Current Implementation Reality |
| :--- | :--- | :--- |
| **Authentication** | Registration & Onboarding | **Resolved (P0-1A):** Public registration is disabled. The database default role has been removed to prevent privilege escalation. |
| **Authentication** | Login & Password Flows | **Resolved (P0-1B.1):** Typed `UserRole` enum introduced as application source of truth. Dashboard redirects consolidated across all auth controllers with fail-closed logout for unsupported roles. |
| **Admin** | Staff Management (Ustadz) | Implemented via `UserController` (`UserRole::Ustadz`). Functional database CRUD. |
| **Admin** | Santri Management | Implemented via `SantriController`. Direct CRUD on `santris` table. |
| **Admin** | Subject Management (*Mapel*) | Implemented via `SubjectController`. Direct CRUD on `subjects` table. |
| **Admin** | Schedule Management (*Jadwal*) | Implemented via `JadwalController`. Connects `user_id`, `subject_id`, and string `kelas`. |
| **Ustadz** | Schedule Viewing | Implemented via `Ustadz\JadwalController`. Filtered by logged-in `user_id`. |
| **Ustadz** | Santri Browsing | Implemented via `Ustadz\SantriController`. Read-only views of santri master data. |
| **Ustadz** | Grading (*Penilaian*) | Implemented via `PenilaianController`. Form records scores tied to `user_id`, `santri_id`, and `subject_id`. |
| **Ustadz** | Materials (*Materi*) | Implemented via `MateriController`. File upload handling and metadata storage. |
| **Santri** | Student Portal | **Implemented (P0-1B.3/1B.4):** Santri accounts are linked to `users` via `santris.user_id` FK (NOT NULL, UNIQUE). Admin provisions Santri atomically (User + Santri in one transaction). Santri can log in and reach the `santri.dashboard` stub route. Full self-service portal (schedule, materials, grades) is planned for P1-1. |

---

## 4. Security Risks

> [!NOTE]
> **Resolved (P0-1A): Unrestricted Public Registration to Privileged Role**
> The critical vulnerability where public registration created privileged Ustadz accounts has been eliminated.
> 1. Public `/register` endpoints have been removed.
> 2. The unsafe `ustadz` database default has been removed from the users migration, forcing explicit role provisioning.
> 3. Account creation is now correctly restricted to institutional Admin provisioning.

---

## 5. Account Model & Identity Findings

*   **Implemented Relationship (P0-1B.4):** The `Santri` model is connected to an authentication identity via `santris.user_id` (NOT NULL, UNIQUE FK → `users.id ON DELETE RESTRICT`). Admin provisions Santri atomically — a `users` row and a linked `santris` row are created within a single database transaction. `User::santri()` (hasOne) and `Santri::user()` (belongsTo) relationships are established.
*   **Remaining Open Item:** The semantic distinction between `santris.email` (biographical domain email, present in the migration) and `users.email` (authentication credential) requires formal resolution before P1-1. The `santris.email` column exists in the schema but is not currently validated or written by the Santri create form.
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

*   **Test Suite Status:** 71 tests, 183 assertions, all passing (100%). Suite has grown from the initial 38-test baseline as P0-1B and P0-3 milestones added lifecycle, security, and policy tests.
*   **Resolved Route Contract Mismatch (P0-1A & P0-1B.1):**
    *   Authentication action redirects are consolidated using `UserRole` and `User::roleEnum()`. Tests explicitly assert role-specific routing (`ustadz.dashboard`, `admin.dashboard`), while testing fail-closed 403 rejection and session clearance for unsupported roles.

---

## 8. UI Consistency Findings

*   **Design Language:** The application consistently leverages Tailwind CSS utility classes and maintains a cohesive visual identity across Admin and Ustadz layouts.
*   **SweetAlert Integration Reality:**
    *   SweetAlert2 is installed (`package.json`) and imported in several components (e.g., `sweetalert2.all.js`).
    *   *Inconsistency:* Usage is currently uneven across modules. Certain CRUD actions trigger SweetAlert dialogs for success and deletion confirmation, while other screens rely on custom inline flash banners, standard alert divs, or browser default behavior.
    *   *Classification:* This is a **UI/UX consistency and polish finding**, not a security vulnerability. Future recovery tasks should standardize SweetAlert across all forms and destructive actions without redesigning the UI from scratch.

---

## 9. Archive Notice

> [!NOTE]
> **Documentation Files Archived:**
> *   `IMPLEMENTATION_SUMMARY.md` and `MENU_CRUD_GUIDE.md` have been removed from the repository root. They were AI-generated scaffolding artifacts from early development and contained stale or inaccurate claims.
> *   `implementation_plan.md` (P0-3 planning artifact) has been moved to `docs/archive/`.
> *   `docs/references/` contains the authoritative architecture decision records for all completed P0 milestones.

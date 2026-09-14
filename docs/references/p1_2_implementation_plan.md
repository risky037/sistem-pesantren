# P1-2 Santri Portal Foundation Implementation Plan

## 1. Scope

**Explicitly include:**
- Santri dashboard
- own academic profile
- own schedule
- own grades

**Explicitly exclude:**
- LMS
- assignments
- messaging
- attendance
- grade publishing workflow

## 2. Backend Design

**Controllers:**
- `Santri\DashboardController`: Serves the Santri portal dashboard.
- `Santri\ScheduleController`: Retrieves and serves the student's personal schedule.
- `Santri\GradeController`: Retrieves and serves the student's grade records.

**Policies:**
Create `SantriPolicy` with the following methods:

- `viewDashboard`
  - **authorization rule:** User must have the `santri` role and a linked `Santri` identity.
  - **ownership verification:** N/A (Dashboard is not treated as an owned resource).
  - **academic period constraint:** N/A for dashboard access itself, though scoped data components will adhere to the active period.

- `viewSchedule`
  - **authorization rule:** User must have the `santri` role and a linked `Santri` identity.
  - **data constraint:** 
    - `jadwals.kelas` equals authenticated `santri.kelas`
    - `jadwals.academic_period_id` equals allowed academic period (strictly limited to the currently active academic period).

- `viewGrades`
  - **authorization rule:** User must have the `santri` role and a linked `Santri` identity.
  - **ownership verification:** Matches the authenticated user's `santris.id` against `penilaians.santri_id`.
  - **academic period constraint:** Allows retrieving grades from current and historical available periods; future periods are hidden.

## 3. Query Strategy

To ensure data integrity, queries will prevent:
- **horizontal privilege escalation & cross-santri data access:** Controllers will inherently derive context from `Auth::user()->santri`. Data fetching (e.g., retrieving schedules or grades) will use the authenticated user's internal relations or identifier (`santris.kelas` or `santri_id`). Queries will never rely on user-supplied IDs for target context.
- **academic_period tampering:** The user cannot directly choose an arbitrary `academic_period_id`. The server controls accessible periods through authorization rules. For current-period data like Schedules, the period filter will rely entirely on the server-side `AcademicPeriod::requireActive()->id`. Any user-supplied query parameters attempting to override `academic_period_id` will be ignored or rejected.

## 4. Route Design

**Middleware:**
- `auth`
- `role:santri`

**Routes:**
- `GET /santri/dashboard` -> `Santri\DashboardController@index`
- `GET /santri/schedule` -> `Santri\ScheduleController@index`
- `GET /santri/grades` -> `Santri\GradeController@index`

## 5. Frontend Design

**Inertia pages:**
Located in `resources/js/Pages/Santri/`

Expected:
- `Dashboard.jsx`: Primary overview landing for the student.
- `Schedule.jsx`: Read-only grid or list displaying schedule.
- `Grades.jsx`: Read-only view for the gradebook/academic transcript.

No unnecessary UI abstraction or external UI frameworks will be used; the implementation will continue using the existing Tailwind CSS design patterns.

## 6. Testing Strategy

**Feature tests:**
- Santri can access own dashboard.
- Santri cannot access another Santri data.
- Santri cannot access admin routes.
- Santri cannot access ustadz routes.
- `academic_period_id` manipulation is rejected (attempting to view unauthorized periods fails).
- inactive account cannot access portal.

## 7. Database Impact

**Explicitly state:**
No migration expected unless implementation proves required.

## 8. Implementation Order

Breakdown into small PR-sized steps:
1. **Routing and Empty Controllers:** Add the `/santri` route group with `auth` and `role:santri` middleware. Create `DashboardController`, `ScheduleController`, and `GradeController`.
2. **Authorization and Policies:** Create `SantriPolicy` with defined methods. Apply authorization gates inside the controllers.
3. **Data Access Implementation:** Write the strict Eloquent queries for schedule and grade retrieval enforcing ownership, visibility boundaries, and `academic_period` constraints based on server-side logic.
4. **Frontend Delivery:** Build `Dashboard.jsx`, `Schedule.jsx`, and `Grades.jsx` using existing UI patterns.
5. **Security Validation:** Write the comprehensive feature tests covering all access boundary, tampering, and regression constraints.

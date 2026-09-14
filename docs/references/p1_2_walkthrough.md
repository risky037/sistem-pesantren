# P1-2 Santri Portal Foundation Implementation Walkthrough

## 1. Context and Goals
This milestone establishes the initial foundation for the authenticated Santri (student) portal, allowing students to log in, view their dashboard profile, access their class schedules, and review their grades. The implementation adheres to strict security constraints, ensuring horizontal data boundaries are enforced and that the portal is scoped correctly by academic period without exposing deferred product workflows (such as the LMS or grading release logic).

## 2. Backend Implementation
### Controllers
Three new controllers were implemented in the `App\Http\Controllers\Santri` namespace:
- **`DashboardController`**: Retrieves the basic profile of the authenticated Santri to display on the dashboard landing page.
- **`ScheduleController`**: Uses the `AcademicPeriod::active()` scope to safely fetch the schedules bound to the Santri's specific `kelas` (class) and the active term.
- **`GradeController`**: Fetches the Santri's personal grades spanning across academic periods.

### Authorization (Policies)
A dedicated `SantriPolicy` was created for the UI pages:
- **`viewDashboard`**: Validates the user has the `santri` role and an active Santri profile.
- **`viewSchedule`**: Inherits the same role/profile validation. The data itself is inherently constrained in the controller to only retrieve matching `jadwals.kelas`.
- **`viewGrades`**: Ensures the user has the correct role/profile before fetching their `penilaians`. Ownership is naturally enforced by the Eloquent query `where('santri_id', $user->santri->id)`.

These policies are enforced globally via `Gate::authorize(...)` inside each respective controller method.

### Route Definitions
The `routes/web.php` file was updated to map the Santri HTTP endpoints under a unified route group protected by the `auth` and `role:santri` middlewares:
- `GET /santri/dashboard` -> `Santri\DashboardController@index`
- `GET /santri/schedule` -> `Santri\ScheduleController@index`
- `GET /santri/grades` -> `Santri\GradeController@index`

## 3. Frontend Implementation
The user interface was crafted in `resources/js/Pages/Santri/` using existing Tailwind utility classes and project components:
- **`SantriLayout.jsx`** and **`Sidebar.jsx`**: A cohesive navigation wrapper tailored for Santri, styled with Emerald accents to distinguish it visually from the Admin and Ustadz panels.
- **`Dashboard.jsx`**: A welcoming landing page presenting the Santri's basic profile details (NIS, class, program, and status).
- **`Schedule.jsx`**: A read-only schedule grid, sorted chronologically by day and time, constrained to the current academic term.
- **`Grades.jsx`**: A structured gradebook grouped historically by the Academic Period, allowing the Santri to view their academic trajectory.

## 4. Testing & Verification
A new feature test suite (`tests/Feature/SantriPortalTest.php`) was authored to guarantee compliance with the architectural security constraints:
- **`test_santri_can_access_own_dashboard`**: Validates successful access and authorization integration.
- **`test_santri_cannot_access_admin_routes`** & **`test_santri_cannot_access_ustadz_routes`**: Asserts lateral role boundaries are impenetrable.
- **`test_santri_cannot_view_another_santri_grades`**: Proves that data querying is tightly bound to the authenticated user's ID, preventing horizontal privilege escalation.
- **`test_santri_cannot_manipulate_academic_period_id`**: Asserts that URL parameter manipulation fails, as the server autonomously dictates the active period reference.
- **`test_inactive_santri_cannot_access_portal`**: Validates that deactivated accounts are expelled to the login screen.

Additionally, the `AcademicPeriodFactory` was populated with default states to ensure the database layer operates cohesively during test executions.

All tests passed successfully, and static analysis via `pint` and `npm build` yielded no anomalies.

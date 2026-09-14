# P1-2 Santri Portal Architecture Review

## 1. Current State Assessment
The Santri portal is currently in a stubbed state. Santri accounts can be provisioned by the Admin, linking a `User` record to a `Santri` record via the `santris.user_id` foreign key. The authentication flow correctly handles Santri logins and routes them to a stubbed `/santri/dashboard` route. The underlying domain models (`Jadwal`, `Materi`, `Penilaian`) and their corresponding policies (`JadwalPolicy`, `MateriPolicy`, `PenilaianPolicy`) already contain logic verifying Santri ownership and class membership, but the Santri-facing controllers and UI views are missing.

## 2. Santri Portal Domain Boundary

**Define explicitly:**

**Allowed:**
- own profile
- own schedule
- own grades
- own academic information

**Forbidden:**
- other santri data
- admin resources
- ustadz resources

## 3. Data Access Strategy

**Evaluate:**
- **Option A:** Direct Eloquent queries
- **Option B:** Dedicated Policies
- **Option C:** Read-model/service layer

**Recommend one and justify:**
**Recommendation:** Option A (Direct Eloquent queries)
**Justification:** The project's PRD strictly prohibits speculative abstractions such as generic repository patterns or service layers (Option C). The data access requirements for the Santri portal are relatively straightforward. Direct Eloquent queries in the controllers, combined with standard Laravel routing middleware and single-model policies (for individual resource access), align perfectly with the existing monolithic Laravel architecture and maintain the application's pragmatic simplicity. 

## 4. Authorization Design

**Define required policies:**

**Example:**
SantriPolicy

**Methods:**
- viewDashboard
  - **allowed condition:** User has role `santri` and has an active linked `Santri` profile.
  - **denied condition:** User lacks the `santri` role or has no associated `Santri` record.
  - **ownership verification:** Matches the authenticated user to their own dashboard context.
- viewSchedule
  - **allowed condition:** User is viewing the schedule for their own `kelas` and the active academic period.
  - **denied condition:** User attempts to view a schedule for another `kelas` or an unauthorized period.
  - **ownership verification:** Authenticated user's `santris.kelas` must match the `jadwals.kelas`.
- viewGrades
  - **allowed condition:** User is retrieving their own grade records.
  - **denied condition:** User attempts to retrieve grades for another student.
  - **ownership verification:** Authenticated user's `santris.id` must match `penilaians.santri_id`.

## 5. Academic Period Behavior

**Define:**

**Current period visibility**
- **Schedule:** current period only
- **Material:** current period visible
- **Grades:** current and historical available records visible

**Historical period visibility**
- **Schedule:** hidden
- **Material:** historical visibility configurable
- **Grades:** current and historical available records visible

**Future period visibility**
- **Schedule:** hidden
- **Material:** hidden
- **Grades:** hidden

## 6. UI Scope

**Define:**

**Included:**
- dashboard
- profile summary
- schedule page
- grades page

**Excluded:**
- LMS
- assignment
- grade publishing workflow
- messaging
- attendance workflow

## 7. Database Impact

**Explicitly state:**

- **migrations required:** No. (The grade publishing workflow and `is_published` column are treated as deferred product decisions).
- **new tables required:** No. The required foundation tables are already accounted for in the existing schema and P1-1 roadmap.

## 8. Testing Strategy

**Include security tests:**

- Santri cannot access another Santri data
- Santri cannot access Admin route
- Santri cannot access Ustadz route
- inactive Santri cannot login
- Santri cannot manipulate `academic_period_id` to access unauthorized records

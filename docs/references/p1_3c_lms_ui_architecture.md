# P1-3C LMS UI Foundation Architecture

## 1. UI Scope Boundary

### Included
- **Ustadz assignment management UI**: Views to list assignments (`Index`), create assignments (`Create`), and edit draft assignments (`Edit`).
- **Ustadz submission viewing UI**: View to list submissions for a specific assignment (`Submissions`) with an integrated read-only modal dialog to inspect individual santri answers.
- **Santri assignment listing UI**: View to list all open assignments matching the Santri's class (`Index`).
- **Santri assignment detail & submission UI**: Consolidated single view (`Show`) to inspect assignment instructions, create/save draft submissions, edit drafts, and finalize submissions.

### Excluded
- **grading UI**: Inputting grades for submissions is out of scope.
- **feedback UI**: Providing qualitative feedback is out of scope.
- **score UI**: Viewing scores is out of scope.
- **Penilaian integration**: Linking LMS assignments to Penilaian forms.
- **grade publishing**: Releasing grades to students.
- **notifications**: No push/in-app notifications for new assignments or submissions.
- **file upload**: Only text-based submissions are supported initially.


## 2. Frontend Architecture

### Page Structure
- **Ustadz**: 
  - `resources/js/Pages/Ustadz/Assignment/Index.jsx`
  - `resources/js/Pages/Ustadz/Assignment/Create.jsx`
  - `resources/js/Pages/Ustadz/Assignment/Edit.jsx`
  - `resources/js/Pages/Ustadz/Assignment/Submissions.jsx`
- **Santri**:
  - `resources/js/Pages/Santri/Assignment/Index.jsx`
  - `resources/js/Pages/Santri/Assignment/Show.jsx`

### Component Reuse Strategy
Leverage existing UI primitives in `resources/js/Components/`:
- `PageHeader.jsx` for consistent page titles and primary actions.
- `DataTableWrapper.jsx` for consistent table layouts.
- `ActionButtons.jsx` for aligning action buttons within table rows.
- `EmptyState.jsx` for handling empty lists gracefully.
- `InputError.jsx`, `InputLabel.jsx`, `TextInput.jsx`, `FormTextarea.jsx` for forms.
- `Pagination.jsx` for paginated results.

### Layout Usage
- Ustadz pages must use `UstadzLayout`.
- Santri pages must use `SantriLayout`.

### Navigation Placement
- Add an "Assignments" or "Tugas" link in the `UstadzLayout` sidebar.
- Add an "Assignments" or "Tugas" link in the `SantriLayout` sidebar.

### Form Strategy
- Use Inertia's `useForm` hook for all forms.
- Limit `SweetAlert2` (`Swal.fire`) usage to strictly three actions:
  - Delete an assignment
  - Close an assignment
  - Finalize a submission (draft to submitted)
- Server-side validation errors automatically mapped to fields using Inertia `errors` prop and displayed via `InputError` component.


## 3. Inertia Data Contract

### Expected props from controllers

#### Ustadz
- **Assignment Index props**: `assignments` (paginated list of assignments for the active period, including related `subject`), `filters` (current search/filter state).
- **Assignment Show props (Submissions)**: `assignment` (the assignment model with related `subject`), `submissions` (paginated list of submissions including related `santri` data).

#### Santri
- **Assignment Index props**: `assignments` (paginated list of `open` assignments matching the Santri's `kelas` for the active period, including related `subject`), `filters` (current search/filter state).
- **Assignment Show props**: `assignment` (the assignment model including related `subject` and `ustadz`), `submission` (the Santri's existing submission if it exists, to populate the initial draft state or display final submitted content).


## 4. Security Boundary

Frontend is not trusted. It serves only as a presentation layer.

Authorization remains strictly enforced in:
- **Policies** (`AssignmentPolicy`, `SubmissionPolicy`)
- **Controllers** (handling server-side ID resolution, querying correct periods)
- **Form Requests** (`StoreAssignmentRequest`, `UpdateAssignmentRequest`, `StoreSubmissionRequest`, `UpdateSubmissionRequest`)

**Frontend Permission Principle:**
- **Frontend hides unavailable actions**: The UI should gracefully hide buttons or forms the user cannot use (e.g., hiding the "Submit" button if the assignment is closed).
- **Backend remains authoritative**: Never rely on hidden fields or disabled inputs for security constraints. Fields like `santri_id`, `ustadz_id`, and `academic_period_id` must be determined server-side from session data and active configurations, ignoring any frontend tampering.


## 5. Submission UX Lifecycle

### UI states

#### draft:
- **editable**: The Santri can modify the text content of their submission.
- **submit action available**: The UI presents a clear button to transition from draft to submitted. (e.g., "Simpan sebagai Draft" vs "Kumpulkan Tugas").

#### submitted:
- **readonly**: The form inputs are disabled/replaced with text display.
- **cannot edit**: No update or submit buttons are available. (Enforced server-side).


## 6. Route Mapping

### Ustadz
- `GET /ustadz/assignments` -> `ustadz.assignments.index`
- `GET /ustadz/assignments/create` -> `ustadz.assignments.create`
- `POST /ustadz/assignments` -> `ustadz.assignments.store`
- `GET /ustadz/assignments/{assignment}/edit` -> `ustadz.assignments.edit`
- `PUT /ustadz/assignments/{assignment}` -> `ustadz.assignments.update`
- `DELETE /ustadz/assignments/{assignment}` -> `ustadz.assignments.destroy`
- `PATCH /ustadz/assignments/{assignment}/open` -> `ustadz.assignments.open`
- `PATCH /ustadz/assignments/{assignment}/close` -> `ustadz.assignments.close`
- `GET /ustadz/assignments/{assignment}/submissions` -> `ustadz.assignments.submissions.index` (renders `Ustadz/Assignment/Submissions` with read-only answer viewer modal)

### Santri
- `GET /santri/assignments` -> `santri.assignments.index` (renders `Santri/Assignment/Index` via `Santri\AssignmentController@index`)
- `GET /santri/assignments/{assignment}` -> `santri.assignments.show` (renders `Santri/Assignment/Show` via `Santri\AssignmentController@show`)
- `GET /santri/assignments/{assignment}/submission` -> `santri.assignments.submission.create` (renders `Santri/Assignment/Show` via `Santri\SubmissionController@create`)
- `POST /santri/assignments/{assignment}/submissions` -> `santri.submissions.store` (creates draft submission)
- `PUT /santri/submissions/{submission}` -> `santri.submissions.update` (updates draft content)
- `POST /santri/submissions/{submission}/submit` -> `santri.submissions.submit` (finalizes submission to submitted state)


## 7. Testing Strategy

### Frontend/Backend Feature Tests
- **unauthorized access**: Ensure Santri cannot access Ustadz routes and vice versa. Enforce `role` middleware and HTTP 403s.
- **wrong kelas visibility**: Ensure Santri cannot see assignments assigned to a different `kelas`. (Checked via `Santri/SubmissionTest`).
- **wrong ownership**: Ensure Ustadz cannot edit/delete another Ustadz's assignments, and Santri cannot view/edit another Santri's submission.
- **submitted immutability**: Ensure PUT requests to a `submitted` submission fail with HTTP 403.


## 8. Risks and Decisions

### Identify:
- **duplicate components**: Avoid building new buttons or data tables. Re-use `ActionButtons`, `DataTableWrapper`, `PrimaryButton`, etc. to maintain the design system.
- **inconsistent layout**: Ensure the assignment views respect the whitespace, padding, and heading styles established in `Admin/Dashboard` or `Materi/Index`.
- **accidental grading workflow introduction**: The Ustadz submission review UI must *not* expose **score**, **grade**, or **feedback** UI elements, as grading is explicitly deferred to P1-5. It must strictly show the submission content only.
- **duplicating authorization logic**: Avoid duplicating complex authorization logic in React (like checking if a submission is late or validating period bounds). Rely on the backend to provide computed booleans via Inertia props or resource classes.

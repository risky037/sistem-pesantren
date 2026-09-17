# P1-3C LMS UI Foundation Implementation Plan

## 1. Exact React Pages to Create

### Ustadz UI
1. `resources/js/Pages/Ustadz/Assignment/Index.jsx`
   - Lists assignments for the active period (stub exists, needs full implementation).
2. `resources/js/Pages/Ustadz/Assignment/Create.jsx`
   - Form to create a new assignment (title, subject_id, kelas, due_date, description).
3. `resources/js/Pages/Ustadz/Assignment/Edit.jsx`
   - Form to edit an existing draft assignment (title, due_date, description).
4. `resources/js/Pages/Ustadz/Assignment/Submissions.jsx`
   - Lists all submissions for a specific assignment.
5. `resources/js/Pages/Ustadz/Assignment/SubmissionShow.jsx`
   - Detailed view of a single Santri submission (read-only for Ustadz, grading explicitly excluded).

### Santri UI
6. `resources/js/Pages/Santri/Assignment/Index.jsx`
   - Lists all open assignments matching the Santri's kelas.
7. `resources/js/Pages/Santri/Assignment/Show.jsx`
   - Displays assignment details and incorporates the submission form (create/update workflow).

## 2. Existing Components to Reuse

- **Layouts**: `UstadzLayout`, `SantriLayout`
- **Wrappers/Containers**: `PageHeader`, `DataTableWrapper`
- **Feedback & Actions**: `PrimaryButton`, `SecondaryButton`, `DangerButton`, `ActionButtons`, `EmptyState`, `FlashMessage`
- **Forms**: `TextInput`, `InputLabel`, `InputError`, `FormSelect`, `FormTextarea`
- **Navigation**: `Pagination`, `NavLink`
- **Visuals**: `Icon`

## 3. Inertia Props Contract

### Ustadz
- **Index**: `assignments` (paginated), `filters`
- **Create**: `subjects` (dropdown options), `kelas_options` (dropdown options)
- **Edit**: `assignment`, `subjects`, `kelas_options`
- **Submissions**: `assignment` (with related subject), `submissions` (paginated, with related santri)
- **SubmissionShow**: `assignment`, `submission` (with related santri)

### Santri
- **Index**: `assignments` (paginated, with related subject), `filters`
- **Show**: `assignment` (with related subject and ustadz), `submission` (the authenticated Santri's submission, if it exists)

## 4. Controller Expectations

- **Ustadz\AssignmentController**: Must supply lookup data (`subjects`, `kelas_options`) for the create/edit views. Must return standard paginated structures.
- **Ustadz\SubmissionController**: Must load `santri` relationships to display names in the submissions list.
- **Santri\AssignmentController**: Must filter `index` strictly to the Santri's `kelas` and `status=open`.
- **Santri\SubmissionController**: Relies entirely on backend validation. For store/update requests, it must return standard validation errors mapping to Inertia `errors`. 

## 5. Route Dependency Mapping

- `route('ustadz.assignments.index')`
- `route('ustadz.assignments.create')`
- `route('ustadz.assignments.store')`
- `route('ustadz.assignments.edit', assignment.id)`
- `route('ustadz.assignments.update', assignment.id)`
- `route('ustadz.assignments.destroy', assignment.id)`
- `route('ustadz.assignments.open', assignment.id)`
- `route('ustadz.assignments.close', assignment.id)`
- `route('ustadz.assignments.submissions.index', assignment.id)`
- `route('ustadz.assignments.submissions.show', [assignment.id, submission.id])`
- `route('santri.assignments.index')`
- `route('santri.assignments.show', assignment.id)`
- `route('santri.submissions.store')` (or contextual endpoint based on route binding)
- `route('santri.submissions.update', submission.id)`

## 6. Form Behavior using useForm

- **Ustadz Create**: Submits via `POST` to `ustadz.assignments.store`.
- **Ustadz Edit**: Submits via `PUT` to `ustadz.assignments.update`.
- **Santri Submit (Draft)**: Uses `POST` for initial creation, setting `status` to `draft`.
  - *Constraint Check*: The assignment context comes from the route binding, not a trusted hidden field.
- **Santri Submit (Final)**: Uses `PUT` to update an existing draft, setting `status` to `submitted`. 
- **Validation**: All forms immediately map backend validation errors to the inputs via `useForm`'s `errors` object.

## 7. SweetAlert Usage Boundary

`Swal.fire` is strictly limited to three definitive actions:
1. Deleting a draft assignment (`ustadz.assignments.destroy`).
2. Closing an open assignment (`ustadz.assignments.close`).
3. Finalizing a submission from draft to submitted state (preventing accidental lock-in).

## 8. Draft/Submitted UI State Handling

- **Draft State**: The submission form in `Santri/Assignment/Show` renders an active `<FormTextarea>`. Buttons for "Simpan Draft" and "Kumpulkan Final" are visible.
- **Submitted State**: The form inputs are hidden or replaced by a read-only text display (e.g., `<p>`). Both save and submit buttons are entirely hidden.

## 9. Empty State Handling

- Every list view (Ustadz Assignments, Ustadz Submissions, Santri Assignments) must render the `<EmptyState>` component spanning the full table width if `data.length === 0`.

## 10. Pagination Strategy

- All index lists use the `Pagination` component passing the `links` array from the Laravel pagination response (`data.links`).

## 11. Frontend Authorization Display Rules

- **Hide unavailable actions**:
  - Do not render "Edit" or "Delete" buttons for Ustadz assignments unless `status === 'draft'`.
  - Do not render "Open" button unless `status === 'draft'`.
  - Do not render "Close" button unless `status === 'open'`.
  - Do not render "Simpan Draft" or "Kumpulkan Final" buttons for Santri submissions if `submission?.status === 'submitted'`.
- **Do not duplicate backend logic**: The React components must only rely on the string values of `status` provided by the backend to toggle visibility. Do not implement custom date-checking logic for lateness or period-boundary checking.

## 12. Testing Strategy

- **Manual UI Verification**: Render each view to ensure layout consistency with existing Admin/Ustadz patterns.
- **Form State Verification**: Test that validation errors appear correctly below inputs. Test the SweetAlert flow for finalizing submissions.
- **Backend Reliance**: The frontend implementation assumes all feature tests from P1-3A and P1-3B are passing. No backend authorization logic is duplicated or tested within React.

## 13. Implementation Order

1. Complete Ustadz Assignment CRUD (`Index`, `Create`, `Edit`).
2. Implement Ustadz Submissions Viewer (`Submissions`, `SubmissionShow`).
3. Build Santri Assignment Index (`Index`).
4. Build Santri Assignment Details and Submission Workflow (`Show`).

## 14. PR Boundary

The entire UI implementation will be bundled into a single PR for the "P1-3C LMS UI Foundation", as it relies directly on the consolidated data contracts established in P1-3A and P1-3B.

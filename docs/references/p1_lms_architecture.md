# P1-3 LMS Foundation Architecture

**Date:** 2026-09-15
**Refined:** 2026-09-15 (branch: `feature/p1-lms-architecture-refinement`)
**Status:** PROPOSED — Pending Stakeholder Approval
**Scope:** Design and decision record only. Zero code, migrations, or tests produced by this document.
**Foundation Phase:** P1-0, P1-1, P1-2, P1 stabilization — all COMPLETED.

---

## Notation

- **[APPROVED]** — Final decision. Implementation may proceed on explicit sign-off.
- **[REJECTED]** — Alternative explicitly ruled out. Do not implement.
- **[DEFERRED]** — Out of P1-3 scope. Revisit at the indicated milestone.
- **[OPEN]** — Requires stakeholder input. Engineering is blocked until resolved.

---

## 1. LMS Domain Boundary

### What P1-3 LMS Includes

P1-3 establishes the structural anchors for a Learning Management System. The scope is narrowly bounded to:

| Included Area | Description |
|---|---|
| **Assignments** | Ustadz creates an assignment bound to a subject, class, and active period. Defines title, instructions, and due date. |
| **Submissions** | Santri submits work against an open assignment. Tracks submission time and content reference. |
| **Assessment Preparation** | Schema and policy infrastructure that will enable grading workflows in P1-5. Status transitions and submission lifecycle are in scope. |
| **Learning Materials (Materi)** | Already implemented via existing `materis` table. LMS does not replace or duplicate this. |

### Explicitly Out of Scope for P1-3

The following are **excluded** from this phase. Implementing them is a scope violation.

| Excluded Area | Reason |
|---|---|
| **Attendance tracking** | P2-3 concern. No attendance model exists. |
| **Messaging / Chat** | Not in PRD. No infrastructure. |
| **Push / In-App Notifications** | P2+ concern. No queue/websocket infrastructure. |
| **Full grading workflow** | P1-5 concern. P1-3 only creates schema anchor. |
| **Grade publishing workflow** | P1-6 concern. **[DEFERRED]** — not implemented in the current repository. See §4.4. |
| **Question bank / MCQ / Essay evaluation** | Flexible Question Model per ROADMAP.md — a separate, subsequent design task. |
| **Automatic grading** | P1-5. |
| **Santri grade history UI (with published-gate)** | P1-6. |
| **Advanced assessment calculation** | P1-6+. |

---

## 2. Core Domain Decisions

### 2.1 Assignment Ownership

**Context:** Which entity logically *owns* an assignment, determines its Santri audience, and provides the authorization anchor for Ustadz?

**Option A — Assignment belongs to Ustadz (`ustadz_id` only)**

- Pro: Simple. Ownership is unambiguous.
- Con: No structural enforcement that an Ustadz only assigns work to classes they actually teach. Authorization must be duplicated at every write path.
- Con: Santri audience cannot be derived from schema — requires free-form `kelas` field with no relational anchor.

**Option B — Assignment belongs to Subject (`subject_id` only)**

- Pro: Groups curriculum artifacts by subject cleanly.
- Con: A Subject spans multiple Ustadz, multiple classes, and multiple periods. Ownership is ambiguous — any Ustadz who ever taught the Subject could theoretically modify another Ustadz's assignments. Violates horizontal privilege boundary enforced throughout P0-P1 policies.
- Con: Cannot uniquely derive the Santri audience.

**Option C — Composite teaching-scope key (`ustadz_id + subject_id + kelas + academic_period_id`)**

An assignment is created by an Ustadz for a specific subject, class, and period — precisely the context defined by a Jadwal row. This composite drives `MateriPolicy`, `PenilaianPolicy`, and `StorePenilaianRequest`.

- Pro: Ownership derives from the same teaching-scope model used throughout the existing system. No new authorization concept is introduced.
- Pro: Santri audience is structurally deterministic: all Santri whose `santris.kelas` matches the assignment's `kelas`.
- Pro: Consistent with Decision 3 in `p1_domain_decision_record.md`: "Teaching scope fully expressed by `jadwals`."
- Con: More fields on `assignments` table — acceptable; these are the same fields already on `jadwals`.

**[APPROVED] Recommendation: Option C — Composite teaching-scope ownership**

The assignment record carries `ustadz_id`, `subject_id`, `kelas`, and `academic_period_id` as a structural unit. This is not a foreign key reference to a single Jadwal row — it is a denormalized copy of the four-dimensional teaching scope. This avoids coupling LMS directly to a specific Jadwal row (which could be deleted or modified), while preserving structural validity.

**Authorization rule at creation time:** Before an Ustadz may create an assignment for (`subject_id`, `kelas`, `academic_period_id`), the system must verify a matching Jadwal row exists for that Ustadz. This is identical in spirit to `StorePenilaianRequest::authorize()`.

---

### 2.2 Assignment Period Binding

**Decision: `academic_period_id NOT NULL` on assignments.**

**[APPROVED]** An assignment without a period binding is structurally invalid. Rationale:

1. The P1-1 work established `academic_period_id` as the temporal anchor on all academic records (`jadwals`, `penilaians`, `materis`). An assignment floating outside a period breaks this model.
2. Ustadz can only operate within the active period (established in `MateriPolicy` and `PenilaianPolicy`). Assignments must follow the same boundary.
3. Historical isolation requires a period anchor. Without it, submissions from one semester cannot be partitioned from another.
4. Period is resolved automatically from `AcademicPeriod::requireActive()` at creation time — never exposed to form input. This matches `PenilaianController::store()`.

**[REJECTED]** Nullable `academic_period_id` on assignments. Unlike `materis` (where a perennial reusable curriculum library was discussed), assignments are inherently time-bound. There is no institutional scenario where a homework assignment has no semester context.

---

### 2.3 Assignment Status Terminology

**Context:** The previous draft used `draft | published | closed`. The term "published" is problematic because:

1. The project **explicitly defers grade publishing workflow** to P1-6.
2. Using "published" for assignment availability introduces semantic overlap with the deferred grade publication concept — a future maintainer may conflate assignment visibility with grade release.
3. The PRD §3.6 treats "Grade Release & Visibility" as a distinct, separate workflow from assignment creation and availability.

**[APPROVED] Assignment status values: `draft` | `open` | `closed`**

| Status | Meaning |
|---|---|
| `draft` | Created by Ustadz. Not visible to Santri. Ustadz may edit or delete. |
| `open` | Visible to Santri of the matching `kelas` and active period. Submissions are accepted. |
| `closed` | No new submissions accepted. Ustadz may proceed to grade submissions in P1-5. |

**Lifecycle transitions:**
```
draft ──► open ──► closed
              ▲
              └── (no reversal from closed in P1-3 scope)
```

**Rationale for rejecting `published`:**
- "Published" in this project's domain refers to grade publication (making Penilaian results visible to Santri). This is an explicit deferred workflow (P1-6). Using "published" for assignment availability would require renaming during P1-6, causing documentation and code churn.
- `open` unambiguously communicates that the assignment is accepting submissions, without implying any grade release workflow.

**Policy implications:** All references to `status === 'published'` in policy pseudocode are updated to `status === 'open'`. See §4.

---

### 2.4 Submission Ownership

**Who owns a submission?**

A submission is owned jointly by the Assignment and the Santri. The `assignment_id + santri_id` composite uniquely identifies a submission.

**[APPROVED] One submission per Santri per assignment by default.**

The submission table has a `UNIQUE(assignment_id, santri_id)` constraint.

**Resubmission Policy:**

- **[APPROVED]** A `status` column supports the lifecycle: `draft → submitted → graded`.
- **[APPROVED]** While an assignment is `open` and a submission is in `draft` or `submitted` state, the Santri may update their submission via `updateOrCreate` on the unique key.
- **[OPEN — O6]** Whether resubmission is allowed after a `due_date` passes is an institutional policy question. Engineering recommendation: do not structurally block late updates; instead, derive lateness from `submitted_at > due_date` in application logic. Final policy requires stakeholder decision.
- **[DEFERRED]** Multiple-attempt tracking (attempt number, per-attempt history) is deferred to P1-5. P1-3 schema only tracks current/latest state.

**Submission content reference:**

Submissions in P1-3 store a `content` TEXT field for short-form text answers. File upload support (`file_path`) is treated as OPEN per O9. The MVP-safe default is text-only submission, as it avoids file storage complexity and mirrors the existing `materis` pattern only if O9 is resolved in favor of file upload.

---

### 2.5 Submission Status Lifecycle Refinement

**Context:** The previous draft listed `draft | submitted | late | graded` as submission status values. This treats "late" as a primary lifecycle state.

**Problem with `late` as a status:**

1. Lateness is a **temporal condition derived from data**, not an independent workflow state. A submission is late when `submitted_at > assignment.due_date`. This can be computed at query time without a stored status value.
2. Storing `late` as a status requires a background job or trigger to transition `submitted → late` at the due date — introducing speculative infrastructure.
3. Late submissions may still transition to `graded` after the Ustadz evaluates them. Having `late` as a terminal-ish state complicates the lifecycle.
4. Late submission *policy* (whether late submissions are accepted, penalized, or blocked) is an unresolved stakeholder decision (O6). Baking `late` into the status column pre-empts that decision.

**[APPROVED] Submission status values: `draft` | `submitted` | `graded`**

| Status | Meaning |
|---|---|
| `draft` | Santri has started but not submitted. Visible only to that Santri. Not eligible for grading. |
| `submitted` | Santri has finalized and submitted. Visible to Ustadz. Eligible for grading in P1-5. |
| `graded` | Ustadz has assigned a score (reserved for P1-5 use). |

**Lateness is derived, not stored:**

```
is_late = submitted_at IS NOT NULL AND assignment.due_date IS NOT NULL AND submitted_at > assignment.due_date
```

This derivation:
- Requires no status migration if late-submission policy changes.
- Can be computed in the controller or model accessor without a background process.
- Remains accurate even if the due date is retroactively changed by an Admin.
- Keeps the schema MVP-friendly: no process required to mark submissions as late.

**[REJECTED]** `late` as a stored submission status. Lateness is a temporal condition derived from `submitted_at > due_date`, not a workflow state.

---

### 2.6 Relationship With Penilaian

**Context:** `penilaians` currently stores Tugas/UTS/UAS component scores recorded manually by Ustadz. Should LMS assignment grades directly update `penilaians`?

**Analysis:**

| Approach | Description | Risk |
|---|---|---|
| **Direct update to penilaians** | When a submission is graded, the system writes the score into `penilaians.tugas` (or similar). LMS and manual grading share the same record. | High coupling. Manual grading and LMS workflows compete for the same row. Ambiguous source of truth. |
| **Parallel LMS score** | Submissions carry their own `score` field. `penilaians` remains the canonical grade record. A future integration step in P1-5/P1-6 converts submission scores into grade components. | Clean separation. LMS domain is self-contained. Penilaian domain is unchanged in P1-3. |

**[APPROVED] Recommendation: Parallel LMS score — keep LMS assessment separate from Penilaian.**

Rationale:

1. The grading formula (Tugas/UTS/UAS weighting) is an **[OPEN]** stakeholder question (O5 in `p1_domain_decision_record.md`). It is premature to couple LMS scores to a formula not yet finalized.
2. `penilaians` is a working system in production use. Modifying its write path in P1-3 risks regressions.
3. The PRD explicitly separates "Grade Recording" (§3.5) and "Assessment Creation" (§3.6) as distinct workflows.
4. The integration bridge — where a graded submission populates a Penilaian component — is the correct scope of P1-5 (Automatic and Manual Grading). P1-3 should not pre-empt that design.

**Implementation consequence for P1-3:** The `submissions` table includes a nullable `score` column to reserve the field for P1-5 grading. No write path from `submissions.score` to `penilaians` is implemented in P1-3.

**Critical separation rule:**

> LMS submission scores are **operational assessment data** — they represent a work product submitted by a Santri for a specific task.
> `penilaians` records are **official academic records** — they represent the terminal grade for a Santri in a subject for a period.
>
> These are different levels of abstraction. The bridge between them (converting a score on a submitted assignment into a Tugas/UTS/UAS component of the official grade) is a deliberate P1-5 design task. P1-3 must not pre-empt it.

---

### 2.7 Grade Publishing — Repository Audit and Status

**[AUDIT FINDING — CORRECTED]**

The previous review summary (`p1_lms_architecture_review_summary.md`, line 31) listed:

```
penilaians.is_published + Ustadz grade release | COMPLETE
```

**This claim is inaccurate.** Verification of the current repository state shows:

- `database/migrations/2026_06_15_000003_create_penilaians_table.php`: **No `is_published` column exists.**
- `app/Models/Penilaian.php`: **No `is_published` in `$fillable` or `$casts`.**
- `app/Http/Controllers/Santri/GradeController.php`: Queries `Penilaian::where('santri_id', ...)` with **no `is_published` filter** — all penilaian records are visible to the authenticated Santri.
- `app/Policies/PenilaianPolicy.php`: **No grade release or `is_published` logic exists.**

**Conclusion:** The grade publishing workflow (`is_published` column, grade release action, Ustadz "Release Grades" UI) is **NOT implemented**. The claim of "COMPLETE" in the prior summary was an error.

**[DEFERRED]** `penilaians.is_published` and the grade release workflow are deferred to P1-6. This decision is consistent with:
- `p1_2_santri_portal_architecture.md §7`: "The grade publishing workflow and `is_published` column are treated as deferred product decisions."
- `docs/ROADMAP.md P1-6`: "Implement a formalized grade release workflow for teachers."
- The P1-2 actual implementation: grades are displayed to Santri without a publish gate (consistent with deferred status).

**Documentation correction applied:** Any reference to `penilaians.is_published` being implemented or `COMPLETE` in this document is removed. References in the LMS architecture to a grade publishing workflow are marked `[DEFERRED — P1-6]`.

**No action required in P1-3:** The LMS architecture does not introduce or depend on `is_published`. The separation between `submissions.score` (operational) and `penilaians` (official record) is sufficient for P1-3 scope.

---

## 3. Database Design

> [!IMPORTANT]
> This is a schema design only. No migrations are created by this document. Migration implementation is gated on stakeholder approval of this architecture.

### 3.1 `assignments` Table

```
assignments
  id                  BIGINT UNSIGNED   PRIMARY KEY
  academic_period_id  BIGINT UNSIGNED   NOT NULL   FK → academic_periods ON DELETE RESTRICT
  subject_id          BIGINT UNSIGNED   NOT NULL   FK → subjects ON DELETE RESTRICT
  ustadz_id           BIGINT UNSIGNED   NOT NULL   FK → users ON DELETE RESTRICT
  kelas               VARCHAR(50)       NOT NULL   -- constrained by config/pesantren.php kelas values
  title               VARCHAR(255)      NOT NULL
  description         TEXT              NULLABLE
  due_date            DATETIME          NULLABLE   -- null = no deadline
  status              VARCHAR(20)       NOT NULL   DEFAULT 'draft'
                                                   -- values: 'draft', 'open', 'closed'
  created_at, updated_at
```

**Indexes:**
- `INDEX (academic_period_id)` — filter by active period
- `INDEX (subject_id, kelas, academic_period_id)` — teaching-scope lookup
- `INDEX (ustadz_id, academic_period_id)` — list Ustadz's own assignments

**Status lifecycle:**
- `draft` — created but not visible to Santri; Ustadz may edit or delete
- `open` — visible to Santri of the matching `kelas`; submissions accepted
- `closed` — no new submissions accepted; grading may proceed in P1-5

> [!NOTE]
> No `UNIQUE(subject_id, kelas, academic_period_id)` constraint — an Ustadz may legitimately create multiple assignments for the same class and subject in one period (e.g., multiple homework tasks).

**On `max_score`:**

The `max_score` column was considered and **intentionally excluded from P1-3**:

- The grading scale and scoring rubric (O5) is an unresolved stakeholder question. Storing a `max_score` without a confirmed policy creates misleading schema.
- P1-3 only reserves `submissions.score` (nullable) for P1-5 use. The scoring ceiling is a P1-5 design decision.
- **Future migration path:** Adding `max_score DECIMAL(5,2) NULLABLE` to `assignments` in P1-5 is a non-breaking additive migration. No redesign is required.

### 3.2 `submissions` Table

```
submissions
  id                  BIGINT UNSIGNED   PRIMARY KEY
  assignment_id       BIGINT UNSIGNED   NOT NULL   FK → assignments ON DELETE CASCADE
  santri_id           BIGINT UNSIGNED   NOT NULL   FK → santris ON DELETE RESTRICT
  submitted_at        DATETIME          NULLABLE   -- NULL = saved as draft; set on first/latest submit action
  content             TEXT              NULLABLE   -- text answer (MVP scope)
  status              VARCHAR(20)       NOT NULL   DEFAULT 'draft'
                                                   -- values: 'draft', 'submitted', 'graded'
  score               DECIMAL(5,2)      NULLABLE   -- reserved for P1-5 grading; null until graded
  created_at, updated_at

  UNIQUE (assignment_id, santri_id)
```

**Indexes:**
- `UNIQUE (assignment_id, santri_id)` — one submission per Santri per assignment; also a lookup index
- `INDEX (santri_id)` — Santri views their own submissions
- `INDEX (assignment_id, status)` — Ustadz reviews submissions by status

**Cascade note:** `ON DELETE CASCADE` from `assignments` is intentional. If an assignment is deleted (Admin action), all associated submissions are removed. Submissions without a parent assignment are semantically invalid.

**On file attachments:**

File upload support (`file_path`, `original_file_name`) is **deferred from the core schema** pending stakeholder decision O9. Rationale:

- MVP text-only submission covers the primary use case: Santri answers a question with a typed response.
- File storage introduces frontend complexity (file upload component) and backend complexity (storage validation, path management).
- If O9 resolves in favor of file upload, adding `file_path VARCHAR(255) NULLABLE` and `original_file_name VARCHAR(255) NULLABLE` is a non-breaking additive migration. No schema redesign is required.
- The existing `materis` file-handling pattern (store path in DB, file in `storage/app/`) is the reference implementation if file upload is approved.

**Lateness derivation (no stored column required):**

```
is_late = (submitted_at IS NOT NULL)
        AND (assignment.due_date IS NOT NULL)
        AND (submitted_at > assignment.due_date)
```

This can be expressed as an Eloquent accessor on the `Submission` model or computed in the controller.

### 3.3 Schema Adequacy Review

The two proposed tables are sufficient for P1-3 goals. No additional tables are needed at this stage. The following columns were considered and deliberately excluded:

| Column | Decision |
|---|---|
| `submissions.catatan_ustadz` (Ustadz feedback text) | Deferred to P1-5. P1-3 only creates the schema anchor. |
| `assignments.max_score` | Deferred. Grading scale is an open policy question (O5). |
| `assignments.allow_late_submission` (boolean) | Deferred. Late submission policy is OPEN O6. Lateness derived from `submitted_at > due_date`. |
| `assignments.question_type` (MCQ vs essay) | Deferred. Flexible Question Model is a separate design task per ROADMAP. |
| `assignments.file_attachment` | Deferred. Ustadz attaching a worksheet file is a UX concern for P1-4, not a P1-3 schema requirement. |
| `submissions.file_path` / `original_file_name` | Deferred pending O9 stakeholder decision. |
| `submissions.late` (boolean column) | [REJECTED] — Lateness is derived from `submitted_at > due_date`, not stored. |
| `penilaians.is_published` | [DEFERRED — P1-6] — Not implemented in current repository. |

---

## 4. Authorization Model

### 4.1 AssignmentPolicy

This policy follows the exact same structural pattern as `MateriPolicy` and `PenilaianPolicy`.

```
AssignmentPolicy::before(User $user, string $ability): ?bool
  Admin  → return true (full management, all periods)
  Others → return null (fall through to method)

AssignmentPolicy::viewAny(User $user): bool
  Ustadz → true
  Santri → true (filtered in controller to their kelas/period)
  Others → false

AssignmentPolicy::view(User $user, Assignment $assignment): bool
  Ustadz → $user->id === $assignment->ustadz_id
  Santri → $user->santri
             && $user->santri->kelas === $assignment->kelas
             && $assignment->status === 'open'
             && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
  Others → false

AssignmentPolicy::create(User $user): bool
  Ustadz → true  (teaching-scope validation happens in StoreAssignmentRequest, not here)
  Others → false

AssignmentPolicy::update(User $user, Assignment $assignment): bool
  Ustadz → $user->id === $assignment->ustadz_id
             && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
             && $assignment->status === 'draft'   (cannot edit an open or closed assignment)
  Others → false

AssignmentPolicy::delete(User $user, Assignment $assignment): bool
  Ustadz → $user->id === $assignment->ustadz_id
             && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
             && $assignment->status === 'draft'   (cannot delete open/closed)
  Others → false

AssignmentPolicy::open(User $user, Assignment $assignment): bool
  -- Transitions assignment from draft → open
  Ustadz → $user->id === $assignment->ustadz_id
             && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
             && $assignment->status === 'draft'
  Others → false

AssignmentPolicy::close(User $user, Assignment $assignment): bool
  -- Transitions assignment from open → closed
  Ustadz → $user->id === $assignment->ustadz_id
             && $assignment->academic_period_id === AcademicPeriod::requireActive()->id
             && $assignment->status === 'open'
  Others → false
```

> [!NOTE]
> The `publish()` method name from the previous draft is renamed to `open()` to align with the revised `draft → open → closed` lifecycle. A separate `close()` method is defined for completeness.

### 4.2 SubmissionPolicy

```
SubmissionPolicy::before(User $user, string $ability): ?bool
  Admin  → return true
  Others → return null

SubmissionPolicy::view(User $user, Submission $submission): bool
  Santri → $user->santri && $user->santri->id === $submission->santri_id
  Ustadz → $submission->assignment->ustadz_id === $user->id
  Others → false

SubmissionPolicy::create(User $user): bool
  Santri → true  (assignment membership validation in StoreSubmissionRequest)
  Others → false

SubmissionPolicy::update(User $user, Submission $submission): bool
  Santri → $user->santri->id === $submission->santri_id
             && in_array($submission->status, ['draft', 'submitted'])
             && $submission->assignment->status === 'open'
  Others → false

SubmissionPolicy::grade(User $user, Submission $submission): bool
  -- Reserved for P1-5 grading workflow; defined here for completeness
  Ustadz → $submission->assignment->ustadz_id === $user->id
  Others → false
```

### 4.3 Cross-Cutting Authorization Rules

The following rules MUST be enforced at every write path. They are the primary authorization boundaries, not optional defense-in-depth.

1. **Cross-class access prevention:** An Ustadz can only create an assignment for (`subject_id`, `kelas`, `academic_period_id`) if a matching `jadwals` row exists for their `user_id`. Validated in `StoreAssignmentRequest::authorize()`, mirroring `StorePenilaianRequest`.

2. **Cross-period access prevention:** All Ustadz write operations must verify `assignment->academic_period_id === AcademicPeriod::requireActive()->id`. Historical assignments are read-only for Ustadz.

3. **Submission without valid assignment prevention:** `StoreSubmissionRequest::authorize()` must verify the target assignment `status === 'open'`, belongs to the active period, and the Santri's `kelas` matches. A Santri cannot manufacture an `assignment_id` pointing to a different class or period.

4. **Inactive account block:** Enforced at session middleware level (existing `is_active` check). No LMS-specific work required.

5. **`academic_period_id` injection prevention:** `academic_period_id` MUST NOT appear as a user-supplied form field. It is always resolved server-side from `AcademicPeriod::requireActive()`.

6. **`santri_id` injection prevention:** `santri_id` on a submission MUST be resolved from `$request->user()->santri->id` server-side. Santri must not supply their own `santri_id` via form input.

7. **`assignment_id` manipulation prevention:** `StoreSubmissionRequest::authorize()` must validate that the target assignment belongs to the Santri's `kelas` and the active period before accepting the submission.

### 4.4 Authorization Boundary Summary

| Actor | Assignments | Submissions |
|---|---|---|
| **Admin** | Full CRUD, all periods | Full access, all periods |
| **Ustadz** | Own assignments in active period only; can transition draft→open→closed | View submissions for own assignments only |
| **Santri** | View `open` assignments for own `kelas` in active period | Own submissions only; create/update while assignment is `open` |

---

## 5. Academic Period Boundary

### 5.1 Rules for LMS Data and AcademicPeriod

| Rule | Scope | Enforcement Point |
|---|---|---|
| No assignment without a period | Assignment creation | `assignments.academic_period_id NOT NULL` + FK RESTRICT |
| No submission without a valid assignment period | Submission creation | `StoreSubmissionRequest::authorize()` checks assignment period = active |
| Ustadz can only create/edit assignments in the active period | Write operations | `AssignmentPolicy::create/update/delete` + `StoreAssignmentRequest` |
| Santri can only submit to `open` assignments in the active period | Submission creation | `StoreSubmissionRequest::authorize()` |
| Historical assignments are read-only for Ustadz | All write operations | `AssignmentPolicy::update/delete` period check |
| Historical submissions are read-only for all non-Admin | All write operations | `SubmissionPolicy::update` period check via assignment |
| Admin can view and manage all periods | All operations | `AssignmentPolicy::before()` returns true for Admin |

### 5.2 Historical Access Rules

- **Santri:** May view their own past submissions (read-only). The Santri portal shows historical submissions scoped strictly to `santri_id = $user->santri->id`. No period filter — the authenticated Santri sees all their own submissions across periods.
- **Ustadz:** May view their historical assignments and submitted work (read-only). Cannot edit or grade historical period data.
- **Admin:** No period restriction on any operation.

---

## 6. Integration With Existing Domain

### 6.1 Jadwal

- **Relationship:** `assignments` does not carry a `jadwal_id` FK. It carries the same four-dimensional key (`ustadz_id + subject_id + kelas + academic_period_id`) that a Jadwal row also holds.
- **Validation use:** `StoreAssignmentRequest::authorize()` queries `Jadwal` to verify the Ustadz's teaching scope — identical to `StorePenilaianRequest`. No schema change to Jadwal.
- **No duplication:** Jadwal represents *scheduling* (when a class meets). Assignments represent *curriculum tasks* (what students must complete). Distinct domain concerns.

### 6.2 Subject

- **Relationship:** `assignments.subject_id FK → subjects`. An assignment is for a specific curriculum subject.
- **No change to Subject model:** Subject remains a simple catalog entity. No LMS-specific methods or relations needed at P1-3.
- **No duplication:** Subject is the shared vocabulary across Jadwal, Materi, Penilaian, and Assignment — a consistent pattern.

### 6.3 Materi

- **Non-overlapping concerns:** `materis` = content uploaded by Ustadz for Santri to read/download. `assignments` = tasks Santri must complete and submit. Distinct domain concepts.
- **No duplication risk:** No FK from `assignments` to `materis` is needed. If an Ustadz wants to reference a Materi from an assignment description, that is a UI concern (a link in the description text), not a schema concern.
- **Shared patterns:** `assignments` follows the same ownership pattern (`ustadz_id + subject_id + kelas + academic_period_id`) as `materis`. Policy structure is parallel.

### 6.4 Penilaian

- **Separation maintained:** As decided in §2.6, LMS submissions and scores remain separate from `penilaians` in P1-3. No FK from `submissions` to `penilaians`.
- **Future bridge (P1-5):** The integration — where an Ustadz converts a graded submission score into a Penilaian Tugas component — is a P1-5 design task. P1-3 reserves `submissions.score` for this purpose only.
- **No duplication:** `penilaians` holds terminal grade records (Tugas, UTS, UAS, Nilai Akhir). `submissions` holds work product and operational evaluation score. Different levels of abstraction.
- **`is_published` on `penilaians`:** This column does **not exist** in the current repository. The grade publishing workflow is deferred to P1-6 per `docs/ROADMAP.md`. P1-3 LMS architecture does not depend on it and must not introduce it.

---

## 7. Scope Boundary Confirmation

The following features are **explicitly excluded** from P1-3 LMS scope. Implementing any of these without a formal scope change is a violation.

| Excluded Feature | Milestone |
|---|---|
| Attendance tracking | P2-3 |
| Messaging / LMS chat | Not in PRD |
| Push or in-app notifications | P2+ |
| Grade publishing workflow (`is_published`) | P1-6 (not yet implemented) |
| Advanced assessment calculation / KKM | P1-6+ |
| Automatic MCQ grading | P1-5 |
| Question bank / flexible question model | Separate P1-3 design task |
| Santri grade history UI with publish gate | P1-6 |
| Co-teacher / multi-grader support | Post-P2 (triggers `subject_assignments` entity) |

---

## 8. Migration Strategy

> [!NOTE]
> Active development phase: direct migration edits and `php artisan migrate:fresh --seed` are permitted per `p1_domain_decision_record.md` Migration Policy.

### Safe Implementation Order

```
Step 1 — assignments table
  Create create_assignments_table migration.
  FK: academic_period_id → academic_periods ON DELETE RESTRICT
  FK: subject_id → subjects ON DELETE RESTRICT
  FK: ustadz_id (users.id) ON DELETE RESTRICT
  Indexes: (academic_period_id), (ustadz_id, academic_period_id),
           (subject_id, kelas, academic_period_id)
  Status enum values: 'draft', 'open', 'closed' — default 'draft'
  Seeder: insert representative assignment rows for the default active period.
  Run: migrate:fresh --seed

Step 2 — submissions table
  Create create_submissions_table migration.
  FK: assignment_id → assignments ON DELETE CASCADE
  FK: santri_id → santris ON DELETE RESTRICT
  UNIQUE(assignment_id, santri_id)
  Status enum values: 'draft', 'submitted', 'graded' — default 'draft'
  No file_path column until O9 is resolved.
  Indexes: (santri_id), (assignment_id, status)
  Seeder: insert sample submissions for seeded assignments.
  Run: migrate:fresh --seed

Step 3 — AssignmentPolicy
  php artisan make:policy AssignmentPolicy --model=Assignment
  Implement before(), viewAny(), view(), create(), update(), delete(), open(), close().
  Registered via Laravel auto-discovery (no manual registration — per existing pattern).
  Write policy unit tests.

Step 4 — SubmissionPolicy
  php artisan make:policy SubmissionPolicy --model=Submission
  Implement before(), view(), create(), update(), grade().
  Write policy unit tests.

Step 5 — Form Requests
  StoreAssignmentRequest: authorize() validates teaching scope against Jadwal.
  UpdateAssignmentRequest: authorize() validates ownership + active period + draft status.
  StoreSubmissionRequest: authorize() validates assignment open, period active,
                          Santri kelas matches assignment kelas.

Step 6 — Controllers (Admin)
  Admin has full CRUD via before() → true in AssignmentPolicy.
  Defer dedicated Admin assignment UI unless O8 is resolved in favor of a UI.

Step 7 — Controllers (Ustadz)
  Ustadz/AssignmentController: index, create, store, edit, update, destroy, open, close.
  Ustadz/SubmissionController: index (view submissions for an assignment), show.

Step 8 — Controllers (Santri)
  Santri/AssignmentController: index (open assignments for Santri's kelas), show.
  Santri/SubmissionController: create, store, update (resubmit if O6 allows).

Step 9 — Frontend (Inertia/React pages)
  Ustadz: Assignment list, create form, edit form, submission review page.
  Santri: Assignment list, assignment detail + submission form.

Step 10 — Feature Tests
  Authorization boundary tests (see Section 9).
  Run full test suite — all 71+ existing tests must remain green.
```

**Each step is independently committable as a separate PR.**

**Dependency graph:**
```
academic_periods (existing)
       |
       +---> assignments (Step 1)
                  |
                  +---> submissions (Step 2)
                  |
                  +---> AssignmentPolicy (Step 3)
                  |
                  +---> SubmissionPolicy (Step 4)
                  |
                  +---> Form Requests (Step 5)
                  |
                  +---> Controllers (Steps 6-8)
                  |
                  +---> Frontend (Step 9)
                  |
                  +---> Tests (Step 10)
```

---

## 9. Testing Strategy

The following security tests are **required** as part of the definition of done. These are not optional.

### 9.1 Assignment Authorization Tests

| Test | Expected Outcome |
|---|---|
| Ustadz creates assignment for a class they teach (active period) | HTTP 200 / assignment created |
| Ustadz attempts to create assignment for a class they do NOT teach | HTTP 403 |
| Ustadz A attempts to edit Ustadz B's assignment | HTTP 403 |
| Ustadz A attempts to delete Ustadz B's assignment | HTTP 403 |
| Ustadz submits request with manually injected past `academic_period_id` | HTTP 403 (period resolved server-side; injected value ignored or rejected) |
| Ustadz attempts to edit their own assignment from a past (inactive) period | HTTP 403 |
| Ustadz attempts to edit an `open` or `closed` assignment | HTTP 403 (edit only allowed in `draft`) |
| Ustadz opens (draft → open) their own assignment in active period | HTTP 200 / status changed |
| Ustadz closes (open → closed) their own assignment in active period | HTTP 200 / status changed |
| Admin creates, edits, and deletes any assignment | HTTP 200 |
| Santri attempts to create an assignment | HTTP 403 |

### 9.2 Submission Authorization Tests

| Test | Expected Outcome |
|---|---|
| Santri submits to an `open` assignment for their own kelas (active period) | HTTP 200 / submission created |
| Santri A attempts to view Santri B's submission | HTTP 403 |
| Santri submits with a manually injected `santri_id` belonging to another Santri | HTTP 403 |
| Santri submits to an assignment with `assignment_id` for a different kelas | HTTP 403 |
| Santri submits to a `draft` (not yet open) assignment | HTTP 403 |
| Santri submits to a `closed` assignment | HTTP 403 |
| Ustadz reviews submissions for their own assignment | HTTP 200 |
| Ustadz A attempts to review submissions for Ustadz B's assignment | HTTP 403 |

### 9.3 Cross-Cutting Security Tests

| Test | Expected Outcome |
|---|---|
| Inactive Santri account cannot submit | HTTP 403 (existing `is_active` middleware) |
| Inactive Ustadz account cannot create assignment | HTTP 403 |
| Request with no `academic_period_id` form field is accepted (derived server-side) | HTTP 200 |
| Request with tampered `academic_period_id` in form body | HTTP 403 or value overridden server-side |
| Santri views their own submission history across historical periods (read-only) | HTTP 200 with only own data |
| Submission for overdue assignment is accepted if O6 allows; `is_late` is derived | HTTP 200; `submitted_at > due_date` is true |

### 9.4 Regression Tests

All 71+ existing PHPUnit tests must remain green after each implementation step. Specific regression scenarios:

- Penilaian workflow is unaffected by LMS work (submit grades, view grades — no `is_published` flag exists or is required by current implementation).
- Materi upload/download workflow is unaffected.
- Santri portal schedule and grade views are unaffected.
- Academic period activation/deactivation is unaffected.

---

## 10. Risks

### 10.1 Over-Coupling LMS With Grades (HIGH)

**Risk:** Premature integration of `submissions.score` into `penilaians` during P1-3 before the grading formula (O5) and grade release granularity (O4) are resolved.

**Mitigation:** Decision 2.6 explicitly defers the integration bridge to P1-5. The `submissions.score` field is nullable with no write path to `penilaians` in P1-3. Enforce this boundary in code review.

### 10.2 Assignment Ownership Ambiguity (MEDIUM)

**Risk:** A future requirement introduces a co-teacher or evaluator role where Ustadz B grades submissions for Ustadz A's assignment. The current single-owner model does not support this without a schema change.

**Mitigation:** Documented. Decision 3 in `p1_domain_decision_record.md` identifies the co-grader scenario as the trigger for a `subject_assignments` entity. If this surfaces, the correct fix is adding a `co_grader_id` column or an `assignment_reviewers` pivot table — not relaxing the current policy. The P1-3 schema is deliberately minimal.

### 10.3 Historical Data Leakage (HIGH)

**Risk:** A controller query omits the period filter, exposing assignments or submissions from other periods. This is the same class of vulnerability found in `StorePenilaianRequest` pre-stabilization (see `p1_final_stabilization_audit.md` §1).

**Mitigation:**
- `assignment.academic_period_id` is always filtered in Ustadz index queries by `AcademicPeriod::requireActive()->id`.
- Policy `update/delete/open/close` checks the period explicitly.
- The Santri submission history view must be explicitly scoped to `santri_id = $user->santri->id` — showing all periods for the authenticated Santri only, never crossing to another Santri.
- Security tests in §9 must cover period tampering explicitly.

### 10.4 Submission Content Strategy (MEDIUM)

**Risk:** Storing submission content as TEXT may cause the `submissions` table to bloat at scale.

**Mitigation:** For P1-3 MVP, text-only submission is the safe default. File upload handling (if O9 resolves in favor) follows the `materis` pattern: store path in DB, file in `storage/app/`. A separate `submission_files` table or object storage solution is a P2+ concern.

### 10.5 Future Migration Complexity (LOW)

**Risk:** When Flexible Question Model (MCQ/Essay) is designed, `assignments` may need `question_bank_id`, `type`, or other columns.

**Mitigation:** `assignments` deliberately omits question-type fields. The `description` TEXT column is a catch-all for free-form instructions until the question bank design is complete. Adding a `type` column or question-bank FK is a non-breaking additive migration.

### 10.6 `kelas` String Drift on Assignments (MEDIUM)

**Risk:** If `assignments.kelas` is not constrained to the same config values as `santris.kelas` and `jadwals.kelas`, the authorization chain breaks. A typo causes Santri to see no assignments.

**Mitigation:** `StoreAssignmentRequest::rules()` must validate `kelas` against `config('pesantren.kelas')` — the same source used in existing requests. Identical to mitigation G6 from `p1_domain_decision_record.md`.

### 10.7 `is_published` Misunderstanding (MEDIUM)

**Risk:** A future implementer encounters the review summary's incorrect "COMPLETE" claim for `penilaians.is_published` and assumes grade publishing is implemented.

**Mitigation:** The audit finding in §2.7 explicitly corrects this. The refinement summary documents the correction. The `AGENTS.md` honesty rule applies: do not mark incomplete work complete.

---

## 11. Open Items for Stakeholder Decision

> [!IMPORTANT]
> The following items require stakeholder decisions before implementation can proceed on the indicated steps.

| ID | Question | Blocks | Owner |
|---|---|---|---|
| **O6** | **Resubmission Policy:** After `due_date` passes, can Santri update their submission? Or is it locked (only Ustadz/Admin can view)? Engineering default: no structural lock; lateness derived from `submitted_at > due_date`. | `StoreSubmissionRequest`, late-submission UI | Stakeholder |
| **O7** | **Assignment visibility to Santri:** Is an `open` assignment visible to all Santri in matching `kelas`, or only to Santri with an active Jadwal row for that subject? Current recommendation: all Santri in `kelas`. | `AssignmentPolicy::view()` for Santri | Stakeholder |
| **O8** | **Admin assignment UI:** Does Admin need a dedicated assignment management page, or is Admin management acceptable at the database/model level only for P1-3? | Admin controller scope (Step 6) | Stakeholder |
| **O9** | **File submission:** Is file upload support required in P1-3, or is text-only submission sufficient for the initial release? | `submissions.file_path` column, frontend file upload component | Stakeholder |

---

## 12. Summary of Decisions

| Decision | Outcome |
|---|---|
| Assignment ownership model | **Composite teaching scope (ustadz_id + subject_id + kelas + academic_period_id)** — Option C approved |
| `academic_period_id` on assignments | **NOT NULL — required** — nullable rejected |
| Assignment status terminology | **`draft` / `open` / `closed`** — `published` rejected (avoids grade-publishing confusion) |
| Submission ownership | **Joint: assignment_id + santri_id** — UNIQUE constraint enforces one per Santri |
| Submission status | **`draft` / `submitted` / `graded`** — `late` removed; lateness derived from `submitted_at > due_date` |
| Resubmission | **Status-based; lateness is derived** — resubmission lock policy is OPEN O6 |
| LMS scores vs Penilaian | **Separate — no coupling in P1-3** — integration bridge deferred to P1-5 |
| `penilaians.is_published` | **[DEFERRED — P1-6]** — Not implemented in current repository; prior "COMPLETE" claim was erroneous |
| Grade publishing workflow | **[DEFERRED — P1-6]** — Not in P1-3 scope |
| `assignments.max_score` | **[DEFERRED — P1-5]** — Additive migration when grading policy resolved |
| File submission (`submissions.file_path`) | **[DEFERRED — pending O9]** — Text-only submission is MVP default |
| Service layer / repository pattern | **[REJECTED]** — Direct Eloquent in controllers per existing pattern and PRD |
| Question bank / MCQ / Essay | **[DEFERRED]** — Separate design task per ROADMAP |
| Attendance, messaging, notifications | **[EXCLUDED]** — Out of LMS scope entirely |
| Advanced assessment calculation | **[EXCLUDED]** — P1-6+ scope |

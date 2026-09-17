# P1-3C UI Architecture Review Summary

## Overview
This document summarizes the architectural review for the P1-3C LMS UI Foundation. The review defines the frontend constraints, boundaries, and reusable component strategy for Ustadz and Santri assignment management, ensuring strict adherence to the established MVP scope and security policies.

## Key Outcomes

### 1. Scope Containment
- **Included**: Ustadz assignment CRUD (drafts only for editing), submission viewing. Santri assignment browsing, draft creation, and final submission.
- **Excluded**: Grading workflows, score visibility, grade publishing (Penilaian), and file uploads are strictly deferred to future milestones (P1-5, P1-6).

### 2. Frontend Architecture
- **Inertia & Layouts**: Ustadz pages use `UstadzLayout` and Santri pages use `SantriLayout`. 
- **Component Reuse**: The design heavily relies on existing primitives: `PageHeader`, `DataTableWrapper`, `ActionButtons`, `EmptyState`, and Form components (`TextInput`, `InputError`, etc.) to maintain consistency and prevent duplication.
- **Form Handling**: Utilizes Inertia's `useForm` and `SweetAlert2` for confirmation dialogs (especially for destructive or state-changing actions).

### 3. Security Boundary Reinforcement
- **Untrusted Frontend**: The UI is treated as untrusted. No hidden fields are used for critical identifiers like `academic_period_id` or `santri_id`. All authorization and data scoping is enforced server-side via Policies and FormRequests.
- **Submission Lifecycle Enforcement**: The UI gracefully handles the transition from `draft` (editable) to `submitted` (readonly) states, reflecting the immutable nature of submitted assignments as enforced by the backend.

### 4. Route Mapping
- Detailed mappings for all expected `ustadz.assignments.*`, `santri.assignments.*`, and `santri.submissions.*` routes, establishing a clear contract for the Inertia page props.

### 5. Verification Plan
- A strict testing strategy is outlined to ensure correct visibility rules (e.g., Santri can only see their own class's assignments), ownership bounds, and immutability of submitted work are enforced across both frontend interactions and backend API requests.

## Next Steps
- Await stakeholder approval on the proposed UI architecture.
- Upon approval, proceed with implementing the React/Inertia pages as per the established blueprint.

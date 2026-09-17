# P1-3C UI Architecture Final Review

## Overview
This document finalizes the architectural guidelines for the P1-3C LMS UI Foundation by incorporating the final round of refinements. It ensures tight alignment with the P1-3B backend implementation and reinforces core security and UX principles.

## Refinements Applied

1. **Santri Submission Routes Context**: Clarified that for Santri submissions (`POST /santri/submissions`), the `assignment_id` is passed via the form payload. The backend securely resolves the `santri_id` and validates all assignment constraints (such as academic period and kelas matching), preventing payload injection.
2. **Inertia Data Contract Expansion**: Expanded the defined props to include search/filter state (`filters`) and comprehensive model relationships (`subject`, `santri`, `ustadz`) for both Index and Show views. This guarantees the frontend receives the necessary context directly from the controllers.
3. **Ustadz UI Restrictions**: Explicitly documented that the Ustadz submission review UI must *not* expose `score`, `grade`, or `feedback` elements. This enforces the boundary that grading workflows are strictly deferred to P1-5.
4. **SweetAlert Usage Guardrails**: Restricted the use of `Swal.fire` to exactly three destructive or significant state-changing actions: deleting an assignment, closing an assignment, and finalizing a submission. This prevents modal fatigue and maintains UI consistency.
5. **Frontend Permission Principle**: Formalized the rule that the frontend must hide unavailable actions to provide a seamless UX, but the backend remains the absolute authoritative enforcer of security. The frontend must never rely on hidden fields or disabled inputs as security barriers.
6. **Risk Mitigation (Authorization Logic)**: Identified the risk of duplicating complex backend authorization logic (like lateness calculation or period boundary checks) in React. The frontend should instead rely on computed booleans provided by the backend via Inertia props or API resources.

## Status
The architecture document has been updated and is ready for final stakeholder approval before implementation begins.

# Sistem Pesantren

Sistem Pesantren is a practical pesantren management and learning system designed to streamline daily academic workflows for Admins, Ustadz, and Santri. The system provides core master data management, academic scheduling, and will evolve to include LMS-like capabilities such as flexible assessments and grading.

> [!WARNING]
> **This project is currently under active development.** It is not production-ready. Do not deploy this application to a public environment. The P0 security and stabilization milestones are complete; P1 feature development has not yet begun.

## Technology Stack

The project repository specifies the following core package constraints:

*   **Language:** PHP `^8.3` *(Audited local runtime: PHP 8.4.16)*
*   **Backend Framework:** Laravel `^13.8` *(Audited local runtime: Laravel 13.15.0)*
*   **Client-Side Bridge:** Inertia.js v2 (`inertiajs/inertia-laravel` `^2.0`, `@inertiajs/react` `^2.0`)
*   **Frontend Library:** React 18 (`^18.2.0`)
*   **Styling:** Tailwind CSS 3.4 (`^3.4.19`)
*   **Feedback & Alerts:** SweetAlert2 (`^11.26.25`)

### Database Strategy

*   **Intended Deployment Database:** MySQL (production target for institutional persistence).
*   **Local Development & Testing Configuration:** SQLite (configured as default in `.env.example` and utilized for rapid automated test runs).

## Current Roles

The system is designed for three main institutional actors:
*   **Admin:** Manages core master data (Users, Santri, Subjects, Schedules).
*   **Ustadz:** Manages learning materials, views assigned schedules, and inputs grades.
*   **Santri:** *(Planned)* Will access an authenticated portal to view schedules, download materials, and submit assignments.

## Setup Instructions

1.  Clone the repository.
2.  Install PHP dependencies: `composer install`
3.  Install NPM dependencies: `npm ci`
4.  Copy environment file: `cp .env.example .env`
5.  Generate application key: `php artisan key:generate`
6.  Run database migrations: `php artisan migrate:fresh`
7.  Build frontend assets: `npm run build`
8.  Serve the application: `php artisan serve`

## Development Commands

*   `npm run dev`: Run Vite development server for client assets.
*   `php artisan test`: Run the PHPUnit test suite.
*   `php artisan route:list`: View all registered routes and middleware.
*   `vendor/bin/pint --format agent`: Run Laravel Pint code formatter.

## Project Structure

*   `app/Models`: Eloquent models representing domain records.
*   `app/Http/Controllers/Admin`: Controllers handling administrative CRUD workflows.
*   `app/Http/Controllers/Ustadz`: Controllers handling academic and teaching workflows.
*   `resources/js/Pages`: Inertia React page components organized by actor role.
*   `docs/`: Official recovery and architecture documentation.

## Documentation

*   [Product Requirements Document (PRD)](docs/PRD.md)
*   [Current State & Technical Audit](docs/CURRENT_STATE.md)
*   [Architecture & Design Guide](docs/DESIGN.md)
*   [Development Roadmap](docs/ROADMAP.md)

> [!NOTE]
> **Documentation:** Authoritative project documentation lives in `docs/`. Architecture decision records for all completed P0 milestones are in `docs/references/`.

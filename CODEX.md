# Codex Instructions

This file is the default working guide for Codex in this repository. Read it before making changes.

## Project Shape

- This is a mini CRM for lead management.
- Backend is PHP Laravel.
- Routes are declared in `routes/web.php`.
- Frontend is React rendered through Inertia.js inside the Laravel source, built with Vite.
- Keep the project simple, readable, and scoped to a mini CRM.

## Required Reading

Before making UI or frontend changes:

- Read and follow `DESIGN.md`.
- Treat `DESIGN.md` as the source of truth for visual design, spacing, colors, typography, cards, buttons, and interaction feel.

Before changing architecture, modules, roles, or business flow:

- Read `docs/architecture/system-architecture.md`.
- Read `docs/architecture/sequence-diagrams.md` when implementing or changing a user flow.

Before changing routes, controllers, request/response contracts, or JSON behavior:

- Read `docs/architecture/api-design.md`.
- Keep page routes and form actions in `routes/web.php` unless the documentation is intentionally changed.
- Prefer `Inertia::render()` for page responses and `redirect()->back()` / named redirects for page-level form actions.
- Keep `response()->json()` only for data-only endpoints such as autocomplete, live search, upload progress, or auth/user probes.
- Protected write requests must respect Laravel session auth and CSRF.

Before changing migrations, models, relationships, seeders, filters, or reporting data:

- Read `docs/data/database-schema.md`.
- Read `docs/data/data-flow.md`.

Before changing environment setup, local run instructions, deployment notes, or health checks:

- Read `docs/infrastructure/infrastructure.md`.

Before choosing the next implementation step:

- Check `docs/implementation-plan.md`.
- Update the plan only when the completed work actually changes project progress.

## Design Rules

- Apply `DESIGN.md` automatically for all UI work. The user should not need to mention it.
- Prefer the existing visual system over inventing a new look.
- The UI should feel like a quiet, operational CRM: clear tables, forms, filters, status indicators, dashboards, and role-specific workspaces.
- Use the documented cream canvas, white surfaces, charcoal primary actions, modest radii, and restrained product-focused layout.
- Do not introduce decorative gradients, oversized marketing sections, or unrelated visual themes.
- Keep text readable and contained across desktop and mobile.

## Implementation Rules

- Follow Laravel conventions for controllers, middleware, validation, Eloquent models, migrations, and seeders.
- Keep role-based access rules consistent with the docs:
    - Admin can manage the whole system.
    - Marketer is limited to their campaigns and related leads.
    - Sales is limited to assigned leads.
    - Public users can only submit public lead forms.
- Store lead processing history through lead activities or assignment records as described in the docs.
- Keep request validation close to controller/form request boundaries.
- Avoid broad refactors unless they are necessary for the requested task.

## Verification

- After code changes, run the smallest useful check for the affected area.
- For frontend changes, start or use the local dev server when needed and visually verify the result.
- For backend changes, prefer focused Laravel tests or at least route/migration checks when tests are not available.
- Mention any checks that could not be run.

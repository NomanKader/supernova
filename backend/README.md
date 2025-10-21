# Supernova Backend

Node.js + Express API for the Supernova LMS SaaS platform. The service targets multi-tenant usage where each `BusinessName` (tenant) maintains isolated data via the database schema.

## Prerequisites

- Node.js 18+
- Access to the Microsoft SQL Server instance provided (see `.env.example`)

## Getting Started

1. Duplicate `.env.example` -> `.env` and adjust the credentials if needed (including `DEFAULT_TENANT_BUSINESS`, which should match the `BusinessName` stored in the `Tenants` table for your workspace). Fill in the SMTP section if you want invitation emails to send automatically.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the database migration scripts against your SQL Server to bootstrap the schema:

   ```sql
   :r backend/db/migrations/001_init.sql
   :r backend/db/migrations/002_user_invites.sql
   ```

   > Using the Web SQL console? Execute each `IF OBJECT_ID(...)` block manually; some tools ignore the `GO` batch separator.
4. Start the API in development mode:

   ```bash
   npm run dev
   ```

   The server boots on `http://localhost:5000` by default and exposes `/health` plus `/api` endpoints.

## Key Concepts

- **BusinessName (Tenant)**: Central entity that owns users, courses, and enrollments. All domain tables carry a `TenantId` foreign key to enforce isolation.
- **Tenant Settings**: Flexible key/value store for tenant-level configuration (branding, feature toggles, etc.).
- **Role-based Access**: `Roles` and `UserRoles` tables allow per-tenant permissions. Global roles are represented with `TenantId = NULL`.
- **LMS Domain**: `Courses`, `Modules`, `Lessons`, `Enrollments`, and `CourseInstructors` provide the learning model foundation.
- **Auditing**: `AuditLogs` captures key events for compliance and analytics.
- **Invitations**: `UserInvites` stores invitation tokens, expiry, and consumption data for password setup emails.

## Project Structure

```
src/
  app.js                # Express app configuration
  server.js             # Server bootstrap (loads env + DB)
  routes/               # HTTP route definitions (tenants, users, invites, etc.)
  services/             # Business logic (tenants, users, invites, ...)
  shared/               # Reusable helpers (env, DB pool, mailer, validation)
db/
  migrations/001_init.sql        # Initial SaaS schema (BusinessName-first)
  migrations/002_user_invites.sql # Invitation tracking table

## Invitation Emails

- Configure `SMTP_*` variables in `.env` to send real emails. Without SMTP configuration the server logs a preview of the email instead.
- Invitation tokens expire after `INVITE_EXPIRY_HOURS` (default 72 hours). Adjust the value to fit your policy.
- Accepting an invite (`POST /api/users/invites/accept`) hashes the password with bcrypt and marks the user as active.
```

## Next Steps

- Flesh out tenants CRUD (update/delete) and integrate authentication.
- Implement course management endpoints tied to the schema.
- Add automated migrations tooling (e.g., `db-migrate`, `knex`, or custom runner).
- Introduce integration tests (Supertest + Jest) once routes expand.

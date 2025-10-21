# Backend Integration Notes

Use these steps to connect the Vite-powered admin frontend to the Express API that lives under `backend/`.

## 1. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Update the values as needed:

- `VITE_API_BASE_URL` – URL where the Node/Express API is running (defaults to `http://localhost:5000`).
- `VITE_BUSINESS_NAME` – The `BusinessName` string stored in the `Tenants` table; used to scope user listings and invitations.

Restart `npm run dev` after changing Vite environment variables so they propagate.

## 2. Backend Environment

The backend expects its own `.env` file (see `backend/.env.example`). Ensure `DEFAULT_TENANT_BUSINESS` matches the same `BusinessName` from the SQL database so multi-tenant lookups succeed. Populate the `SMTP_*` variables and `APP_URL` if you want automatic invitation emails—otherwise the server logs the invite link to the console for manual sending.

## 3. API Endpoints

- `GET /api/users` – Returns the latest users for the configured tenant.
- `POST /api/users` – Creates/invites a user under the tenant (`name`, `email`, `role`, and optional `sendInvite` fields).
- `DELETE /api/users/:userId` – Removes a user from the tenant directory.
- `GET /api/users/invites/:token` – Validates an invitation token (used by the password setup page).
- `POST /api/users/invites/accept` – Accepts an invitation and sets the password for the invited user.

Each users endpoint accepts an optional `businessName` (string) or `tenantId` (number) to override the tenant on a per-request basis.

## 4. Running Everything Locally

```bash
# In backend/
npm install
npm run dev    # boots Express on http://localhost:5000

# In project root
npm install    # if not already done
npm run dev    # Vite dev server (default http://localhost:5173)
```

Key UI routes tied to the backend:

- `http://localhost:5173/admin/users` lists, invites, and deletes users.
- `http://localhost:5173/account/verify?token=...` lets invited users set their password. The invite link points to this page.

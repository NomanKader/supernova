# Supernova LMS Admin Portal

A Next.js + Tailwind (shadcn UI) admin console for managing users, courses, lessons, manual enrollments, assessments, certification workflows, promotions, and marketing pages for the Supernova learning platform.

## Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to view the dashboard. Sign-in flows are stubbed; the interface renders with mock data stored in `src/data/mock-data.ts`.

## Tech Stack

- Next.js App Router (React 19)
- Tailwind CSS v4 with shadcn UI components (manually curated under `src/components/ui`)
- lucide-react iconography and Radix primitives
- @tanstack/react-table, react-hook-form, zod for data grids and forms
- recharts for dashboard visualizations

## Project Structure

```text
src/
  app/(dashboard)/*           # Route group for the admin experience
  components/layout           # App shell, navigation, headers
  components/ui               # shadcn-inspired primitives
  components/dashboard        # Dashboard-specific widgets
  data/mock-data.ts           # Mock domain models (replace with real API)
  types                       # Shared TypeScript interfaces
```

Each feature vertical lives at `src/app/(dashboard)/<section>/page.tsx` with lightweight forms and tables already wired to the mock data.

## Customization Notes

- Tailwind theme tokens live in `tailwind.config.ts` and `src/app/globals.css`.
- shadcn components are hand-copied to avoid CLI network access; adjust as needed when integrating with a design system.
- Replace mock data with server data by swapping in loaders (Server Components) or client fetch hooks.
- `DataTable` in `src/components/data-table.tsx` centralizes search + pagination for all resource tables.
- Charts on the overview page use hard-coded analytics—replace with live metrics as telemetry becomes available.

## Next Steps

1. Hook routes into real APIs and persist form submissions.
2. Add authentication/authorization guard around the dashboard shell.
3. Introduce optimistic mutations & toasts for action feedback.
4. Wire up file upload endpoints for lesson assets and payment proofs.
5. Automate certificate PDF generation and storage integration.

## Scripts

```bash
npm run dev      # start development server
npm run build    # production build
npm run start    # run built app
npm run lint     # lint with ESLint
```

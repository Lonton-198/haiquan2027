# Học cùng lon ton V2 — Ocean Workspace

Full Next.js App Router source package for the existing project. Keeps the existing Supabase-backed study data and API behavior; replaces the application presentation with a coherent Ocean / Forest-inspired glass design and motion system.

## What's included
- One integrated design stylesheet in `app/globals.css` (avoids partial updates missing imported styles)
- Scenic ocean artwork `public/ocean-coast-art.jpg` and existing decorative SVGs
- `components/HomeV2.tsx` three-column dashboard: subjects, learning, review timeline
- Shared styling for dashboard subpages, quiz answers, review, library, statistics and login
- Existing API endpoints and Supabase migration files included for completeness; **do not run migrations again**

## Safety
- Do not upload to `main` until the Preview branch is visually and functionally verified.
- Preview deployments can share the live Supabase database. Preview is not a data sandbox.
- Do not upload your `.env.local` or backups to GitHub.
- No database migration is required for this **UI-only** package.

## Build
```
npm install
npm run build
```
The ZIP has undergone TypeScript/TSX syntax and CSS parser checks, but **production build was not run successfully in the packaging environment** because npm dependency installation timed out. Confirm the Vercel Preview build and test every screen before merging.

See `V2-README-TRIEN-KHAI.md` for the browser/GitHub deployment steps.

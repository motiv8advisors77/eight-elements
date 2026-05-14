# eight-elements

**Eight Elements of Financial Planning** — Next.js app with Supabase auth and client financial plans.

## GitHub

- Remote: configure `origin` to a repository your account can push to (this clone may use `https://github.com/motiv8advisors77/eight-elements.git`).
- CI: pushes and pull requests to `main` or `master` run `.github/workflows/ci.yml` (`pnpm install --frozen-lockfile` and `pnpm run build`).

## Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com/) (framework: Next.js; install command: `pnpm install`; build: `pnpm run build`).
2. Under **Project → Settings → Environment Variables**, set for Production and Preview:
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase **Project URL** (origin only, no `/rest/v1`).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase **anon** `public` key.
   - `NEXT_PUBLIC_SITE_URL` — your deployment base URL (e.g. `https://<project>.vercel.app` or custom domain), no trailing slash. Used for auth redirects when `window` is unavailable.
3. Redeploy after changing env vars.

## Supabase

1. Create a project, then apply SQL migrations in order (SQL Editor or [Supabase CLI](https://supabase.com/docs/guides/cli)):
   - `supabase/migrations/20260214120000_client_plans.sql`
   - `supabase/migrations/20260215120000_client_plans_spouse_name.sql`
2. **Authentication → URL configuration**: set **Site URL** to your primary app URL (production). Under **Redirect URLs**, include every base you use, for example:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-app>.vercel.app/auth/callback`
   - Any custom production domain with `/auth/callback`
3. Copy **Project URL** and **anon key** into `.env.local` locally and into Vercel as above.

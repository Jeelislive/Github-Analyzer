# GitHub Analyzer

A Next.js application that analyzes GitHub repositories and presents AI-powered insights, architecture visualizations, and project health metrics through a modern dashboard.

![Screenshot](https://res.cloudinary.com/dupv4u12a/image/upload/v1758776790/Screenshot_from_2025-09-25_10-33-41_xqh2dz.png)

## Features

- AI Insights Dashboard with multiple tabs (Overview, Team, Business, Recommendations)
- Architecture analysis and visualization (Mermaid-based diagrams, dependency mapping)
- GitHub OAuth authentication using NextAuth and Prisma
- Postgres-backed persistence via Prisma ORM
- Modern UI with Tailwind CSS and Radix UI primitives
- Graceful fallback when AI key is missing (app still works with sample/fallback data)

## Tech Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- UI: Tailwind CSS, Radix UI, Lucide icons
- Auth: NextAuth.js with Prisma adapter and GitHub provider
- Database: PostgreSQL via Prisma
- Charts/Visuals: Chart.js, react-chartjs-2, d3, mermaid
- AI: Google Generative AI SDK (Gemini) [optional]

Key packages: `next`, `react`, `next-auth`, `@prisma/client`, `prisma`, `@octokit/rest`, `@google/generative-ai`, `d3`, `chart.js`, `mermaid`.

## Monorepo Layout

Project root: `github-analyzer/`

Important paths:
- `src/app/` — Next.js app router pages and API routes
- `src/components/` — UI and composite components
  - `src/components/ui/ai-insights-dashboard/` — dashboard tabs including `OverviewTab.tsx`
- `src/lib/` — libraries such as `auth.ts` (NextAuth options), analyzers, Prisma client
- `prisma/` — Prisma schema and migrations
- `public/` — static assets

## Prerequisites

- Node.js 18.18+ (recommended 20+)
- npm 9+ or pnpm/yarn
- PostgreSQL 13+
- A GitHub OAuth App (Client ID and Secret)

## Environment Variables

Create a `.env.local` file in the project root (`github-analyzer/.env.local`). The app uses NextAuth + Prisma and optionally Gemini AI. The code under `src/lib/auth.ts` expects the GitHub provider env variables as `GITHUB_ID` and `GITHUB_SECRET`.

Example:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/github_analyzer"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-strong-random-secret"

# GitHub OAuth (required)
# Note: NextAuth GitHub provider uses GITHUB_ID and GITHUB_SECRET in this codebase.
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Gemini AI (optional)
GEMINI_API_KEY="your-gemini-api-key"
```

GitHub OAuth configuration:
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Database Setup (Prisma)

1. Install dependencies
   ```bash
   npm install
   ```
2. Generate Prisma client
   ```bash
   npx prisma generate
   ```
3. Apply migrations (or create an initial migration if needed)
   ```bash
   npx prisma migrate dev
   ```
   Alternatively, if you do not have migrations yet and want to push the current schema:
   ```bash
   npx prisma db push
   ```

Ensure `DATABASE_URL` in `.env.local` points to a running Postgres database.

## Scripts

- `npm run dev` — Start development server (Turbopack)
- `npm run build` — Build the application
- `npm start` — Start the production server
- `npm run lint` — Run ESLint

## Running Locally

1. Create `.env.local` with all required variables
2. Ensure Postgres is running and accessible
3. Run Prisma steps: `npx prisma generate` and `npx prisma migrate dev`
4. Start the app: `npm run dev`
5. Visit `http://localhost:3000`

## How It Works

- Authentication is configured in `src/lib/auth.ts` using NextAuth with the Prisma adapter and GitHub provider. The session strategy is JWT, and the GitHub access token is attached to the session token for downstream use.
- The landing experience provides a repository input (see `src/components/sections/hero.tsx`). After GitHub sign-in, users can analyze a repository URL.
- The AI Insights Dashboard (`src/components/ui/ai-insights-dashboard.tsx`) renders multiple tabs. The `OverviewTab.tsx` summarizes quality scores, metrics (lines of code, files), project purpose, main technologies, and more. Additional tabs provide team insights, business value, and recommendations.
- Architecture analysis and diagrams are documented in `ARCHITECTURE_SETUP.md`. The analyzer builds component graphs, computes metrics, and renders Mermaid-based visualizations.

## Minimal Usage Flow

1. Sign in with GitHub at `/auth`.
2. On the homepage, paste a repository URL and submit.
3. Open the Dashboard to view:
   - Overview: health score, metrics, technologies, purpose
   - Team Insights: activity and collaboration (as available)
   - Business: value and risk signals
   - Recommendations: suggested improvements

If `GEMINI_API_KEY` is not provided, the app uses safe fallbacks to keep the experience functional.

## Configuration Notes

- The codebase uses NextAuth v4 with JWT sessions and Prisma adapter. If you previously used different env var names for GitHub OAuth (e.g., `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`), ensure both are aligned. This repository expects `GITHUB_ID` and `GITHUB_SECRET`.
- `next.config.ts` currently contains default configuration. Customize as needed for images, headers, or experimental flags.

## Troubleshooting

- Authentication callback error: confirm your GitHub OAuth app callback URL matches `http://localhost:3000/api/auth/callback/github` and that `GITHUB_ID/GITHUB_SECRET` are correct.
- Database connection issues: verify `DATABASE_URL` and that your Postgres instance is reachable. Run `npx prisma migrate dev` again after schema changes.
- Missing AI insights: confirm `GEMINI_API_KEY` is present. The app will still run with fallback data if omitted.
- Build or type errors: run `npm run lint` and ensure Node.js version is compatible. Reinstall dependencies if necessary.

## Project Structure

```text
github-analyzer/
├─ src/
│  ├─ app/                      # Routes and pages (App Router)
│  ├─ components/
│  │  ├─ sections/              # Landing sections (e.g., hero)
│  │  └─ ui/ai-insights-dashboard/
│  │     ├─ OverviewTab.tsx
│  │     └─ ...
│  └─ lib/
│     ├─ auth.ts                # NextAuth config (GitHub provider)
│     └─ prisma.ts              # Prisma client
├─ prisma/
│  ├─ schema.prisma             # Prisma schema
│  └─ migrations/               # Prisma migrations
├─ public/
├─ next.config.ts
├─ package.json
└─ README.md
```

## Contributing

- Use a feature branch workflow
- Keep PRs focused and well described
- Add tests or sample data where applicable
- Run `npm run lint` before submitting

If you plan to change authentication, database schema, or the analysis pipeline, include a migration plan and update relevant docs (`SETUP.md`, `ARCHITECTURE_SETUP.md`).

## Security

- Do not commit `.env*` files or secrets
- Rotate OAuth credentials if exposed
- Use strong `NEXTAUTH_SECRET` in production

## License

Specify your license here (for example, MIT). If you add a `LICENSE` file, reference it in this section.

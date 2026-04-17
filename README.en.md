# DateMatch

DateMatch is a live campus matching product with two parallel modes: romance matching and friendship / companion matching. This repository backs a real online application rather than a static demo.

## Live Product Positioning

- The project has a real online version
- This repository contains core implementation, not just UI mockups
- A public `Live Site` link can be added here later if needed

## Highlights

- Dual-mode matching for `romance` and `friendship`
- Scheduled match releases with round and display-window rules
- End-to-end flow from onboarding to matching, confirmation, and chat
- Server-side session checks on core APIs
- Ops support for announcements, feedback, notifications, and workers

## Tech Stack

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Radix UI
- Framer Motion
- Drizzle ORM
- Local development: SQLite with `better-sqlite3`
- Production deployment: Supabase PostgreSQL
- Notifications: Nodemailer / SMTP / WeChat delivery flows

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

Minimum local setup:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
AUTH_SESSION_SECRET=replace-with-a-long-random-string
OPS_DASHBOARD_TOKEN=replace-with-a-secure-token
```

For email setup, see:

- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)

### 3. Start the app

```bash
npm run dev
```

### 4. Common checks

```bash
npm run typecheck
npm test
npm run build
```

## Database Strategy

### Local default

Local development still defaults to SQLite:

- `datematch.db`
- `datematch-friendship.db`

If PostgreSQL URLs are not configured, the app falls back to these local database files.

### Recommended production setup

For Vercel deployment, the recommended setup is Supabase PostgreSQL with two separate connection strings:

```bash
ROMANCE_DATABASE_URL=postgresql://...
FRIENDSHIP_DATABASE_URL=postgresql://...
```

Recommended structure:

1. Create two Supabase projects
2. Use one for `romance`
3. Use one for `friendship`
4. Configure both URLs in Vercel environment variables

This matches the current dual-database architecture and keeps migration risk low.

## Supabase Initialization and Data Import

The repo now includes built-in scripts for PostgreSQL bootstrapping and SQLite-to-PostgreSQL import.

### Initialize PostgreSQL schema

```bash
npm run db:init:pg
```

You can also initialize only one mode:

```bash
node --loader ts-node/esm scripts/init-postgres-schema.ts romance
node --loader ts-node/esm scripts/init-postgres-schema.ts friendship
```

### Import existing SQLite data into PostgreSQL

```bash
npm run db:import:pg
```

This script:

- reads `datematch.db`
- reads `datematch-friendship.db`
- bootstraps PostgreSQL schema automatically
- imports data into the matching Supabase projects
- resets table sequences after import

It also handles the existing mixed seconds / milliseconds timestamp data found in the current SQLite snapshots.

## Deployment Notes

Recommended deployment order:

1. Create two Supabase PostgreSQL projects
2. Set `ROMANCE_DATABASE_URL` and `FRIENDSHIP_DATABASE_URL` locally
3. Run `npm run db:import:pg`
4. Add the same environment variables in Vercel
5. Redeploy

With this setup, `/ops`, chat, profile edits, login tokens, and notification events will use PostgreSQL instead of relying on bundled SQLite files.

## Docs

- [docs/ARCHITECTURE.md](/E:/code/datematch-main/docs/ARCHITECTURE.md)
- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)
- [docs/product-mechanism.md](/E:/code/datematch-main/docs/product-mechanism.md)
- [docs/knowledge-base/README.md](/E:/code/datematch-main/docs/knowledge-base/README.md)

## Open-Source Boundary

This repository reflects the core implementation of a live product, but it does not include everything required to mirror production exactly.

- private credentials are intentionally excluded
- email, WeChat, and ops features depend on environment-specific configuration
- the codebase is useful for understanding the implementation, but it is not a one-click copy of production

## Suggested GitHub Description

`A live campus matching platform with romance and friendship modes, scheduled releases, chat, notifications, and ops tooling.`

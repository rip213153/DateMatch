# DateMatch

DateMatch is a live campus matching product with two modes: romance matching and friendship matching. The project has a real online version and continues to evolve across questionnaires, profile submission, scheduled match releases, mutual confirmation, chat, email and WeChat notifications, and ops tooling.

## Live Status

This repository is not just a static demo or a portfolio mockup.

- It backs a real, publicly accessible product
- The online version is actively maintained and iterated
- A public `Live Site` link can be added here later if needed

## Highlights

- Dual-mode matching for `romance` and `friendship`
- Scheduled match releases with round and display-window rules
- End-to-end user flow from onboarding to matching, confirmation, and chat
- Server-side session checks on core APIs instead of front-end-only state
- Ops support for announcements, feedback, notifications, and background workers

## Why This Project Matters

DateMatch is not a single-page showcase. It is a real product with a full workflow that combines:

- user-facing pages and interactions
- server routes and business logic
- notifications through email and WeChat
- ops-facing tooling and maintenance docs

If you want to study how a compact but real full-stack product is put together, this repo is designed to be useful.

## Core Capabilities

- Romance and friendship matching run in parallel with isolated databases
- Match results are released on a schedule instead of appearing instantly
- Some profile fields update immediately while others take effect in the next round
- Chat opens after mutual confirmation
- Email and WeChat notifications support reminders and operational workflows
- An ops dashboard supports announcements, overview, and feedback handling

## Tech Stack

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Radix UI
- Framer Motion
- SQLite with `better-sqlite3`
- Drizzle ORM
- Nodemailer and SMTP

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

For email delivery, see:

- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)

### 3. Start the app

```bash
npm run dev
```

On Windows, a background start option is also available:

```bash
npm run dev:hidden
```

### 4. Common checks

```bash
npm run typecheck
npm test
npm run build
```

## Docs

- [docs/ARCHITECTURE.md](/E:/code/datematch-main/docs/ARCHITECTURE.md)
- [SMTP_EMAIL.md](/E:/code/datematch-main/SMTP_EMAIL.md)
- [docs/product-mechanism.md](/E:/code/datematch-main/docs/product-mechanism.md)
- [docs/knowledge-base/README.md](/E:/code/datematch-main/docs/knowledge-base/README.md)

## Open-Source Boundary

This repo reflects the core implementation of a live product, but it does not include everything needed to mirror production exactly.

- private credentials are intentionally excluded
- email, WeChat, and ops features depend on environment-specific configuration
- the codebase is useful for understanding the implementation, but it is not a one-click clone of the full production environment

## Suggested GitHub Description

`A live campus matching platform with romance and friendship modes, timed releases, chat, notifications, and ops tooling.`

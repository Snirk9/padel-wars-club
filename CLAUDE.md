# Padel Wars Club — CLAUDE.md

## Project Overview
A mobile-first private padel league management app. Users create or join isolated clubs, log 2v2 matches, and track standings.

## Tech Stack
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (no `tailwind.config.ts` — configured via `app/globals.css` `@theme`)
- **Supabase** (auth, Postgres, Storage, RLS)
- **Netlify** (hosting)

## Architecture Rules
- Use App Router exclusively — no pages directory
- Server Components for all data fetching; Client Components only for interactive forms/modals
- All mutations go through `app/actions/*.ts` server actions
- Never bypass RLS by using the service role key in the browser
- Route groups: `(auth)` for login/signup, `(app)` for authenticated routes
- Group-scoped pages live under `app/(app)/groups/[slug]/`

## Database
- Run `supabase/schema.sql` in Supabase SQL editor to initialize
- Standings are **computed at read time** from matches — no stored standings table
- `parseScore()` in `lib/utils.ts` handles set differential calculation from score strings
- Score format: `"6-4, 3-6, 7-5"` (comma-separated `A-B` pairs)

## Roles
- `owner` — full control (edit/delete group, transfer ownership)
- `admin` — member management + match deletion
- `member` — can log matches; read-only on admin tools

## Design Constraints
- Mobile-first, light theme only — no dark mode
- Primary color: `#F97316` (orange-500)
- Win color: `#16A34A` (green-600)
- No loud gradients, no neon, no enterprise-style dense tables
- Bottom tab nav inside group context; top bar for all other pages
- All tap targets ≥ 44px

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase Storage
- Bucket name: `avatars` (public)
- Upload path: `{userId}/avatar.{ext}`
- Set bucket policy: authenticated users can upload to their own folder

## Key Files
- `lib/utils.ts` — `parseScore`, `generateSlug`, `cn`, `formatDate`
- `lib/types.ts` — shared TypeScript interfaces
- `lib/supabase/server.ts` — server-side Supabase client
- `lib/supabase/client.ts` — browser-side Supabase client
- `middleware.ts` — auth redirect guard
- `supabase/schema.sql` — full DB schema + RLS policies

## Component Patterns
- `components/ui/` — pure presentational components (Button, Input, Avatar, Card, Badge, Modal, Toast, ConfirmDialog)
- `components/layout/` — AppShell, TopBar, BottomNav
- `components/auth/` — form components (SignupForm, LoginForm, AccountSettingsForm)
- `components/groups/` — group-specific components
- `components/matches/` — MatchCard, AddMatchWizard
- `components/leaderboard/` — StandingsTable
- `components/players/` — player-related components

## What's Deferred (Post-MVP)
- Pair leaderboard (view query exists in schema, UI not built)
- Push notifications
- Season/archive system
- Head-to-head stats
- Shareable invite links

# Padel Wars Club

> Track wins. Settle scores. Keep bragging rights real.

A private padel league manager for friend groups. Create clubs, log 2v2 matches, and watch the standings update in real time.

---

## Tech Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **TypeScript** — end-to-end typed
- **Tailwind CSS v4** — mobile-first, no dark mode
- **Supabase** — auth, Postgres database, file storage, row-level security
- **Netlify** — hosting + deployment

---

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. Go to **Storage** → create a public bucket called `avatars`
4. In the `avatars` bucket, add these policies:
   - **INSERT**: `auth.uid()::text = (storage.foldername(name))[1]`
   - **SELECT**: `true` (public read)
   - **UPDATE/DELETE**: `auth.uid()::text = (storage.foldername(name))[1]`

### 2. Environment variables

Copy `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

- **Auth** — Email/password signup + login, profile photo upload
- **Clubs** — Create private clubs with a join password, multiple clubs per user
- **Members** — Role system: owner / admin / member
- **Matches** — 4-step mobile wizard for logging 2v2 results with structured score input
- **Leaderboard** — Individual standings ranked by wins → set differential
- **Match history** — Full history with delete (admin only)
- **Player profiles** — Per-player stats, best partner, match history
- **Admin tools** — Promote/demote/remove members, transfer ownership
- **Export** — Download match history as CSV
- **Delete** — Club deletion with typed confirmation

---

## Deployment (Netlify)

```bash
# 1. Create GitHub repo and push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/padel-wars-club.git
git push -u origin main

# 2. Connect Netlify to GitHub repo
# 3. Set build command: npm run build
# 4. Set publish directory: .next
# 5. Add environment variables in Netlify dashboard
```

---

## Project Structure

```
app/
  (auth)/        login, signup
  (app)/         authenticated routes
    dashboard/   user's clubs hub
    groups/
      [slug]/    group dashboard, matches, players, settings
account/         user profile + avatar
components/
  ui/            Button, Input, Avatar, Card, Badge, Modal, Toast
  layout/        AppShell, TopBar, BottomNav
  auth/          SignupForm, LoginForm, AccountSettingsForm
  groups/        CreateGroupForm, JoinGroupForm, GroupSettingsPanel
  matches/       MatchCard, AddMatchWizard
  leaderboard/   StandingsTable
lib/
  supabase/      server + browser clients
  types.ts       shared interfaces
  utils.ts       cn, parseScore, generateSlug, formatDate
supabase/
  schema.sql     database schema + RLS policies
```

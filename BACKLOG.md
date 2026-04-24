# Padel Wars Club — Feature Backlog

A running list of feature ideas to build. Add ideas freely; mark status when work begins.

---

## Summary

| Feature | Effort | Status |
|---|---|---|
| Win/Loss Streak | Low | Idea |
| Match Activity Feed | Low | Idea |
| Rivalry Tracker | Low | Idea |
| Match Notes | Low | Idea |
| Seasons | Low | Idea |
| Pair Leaderboard | Medium | Idea |
| Club Icon Picker | Medium | Idea |
| Achievement Badges | Medium | Idea |
| Tournament Mode | Medium | Idea |
| Club Invite Link | High | Idea |
| 1v1 Player Comparison | High | Idea |

---

## Ideas

### 1v1 Player Comparison
**Status:** Idea | **Effort:** High

A dedicated comparison view between any two players in a club.

**What it shows:**
- Overall record for Player A: wins / losses across all club matches
- Overall record for Player B: wins / losses across all club matches
- Head-to-head record: how many times A's team beat B's team (and vice versa) in matches where both players appeared on opposite sides

**Example:**
> A vs B comparison:
> - A overall — 5W / 6L
> - B overall — 3W / 5L
> - Head-to-head — A won 1, B won 2 (out of 3 shared matches)

**UX ideas:**
- Accessible from the Players list: tap a player → their profile → "Compare" button → pick opponent
- Show the head-to-head matches listed below the summary cards

**Data logic:**
- Overall stats: already computed from `individual_standings` view
- Head-to-head: query `matches` where Player A and Player B appear on opposite teams → count wins per side
- No schema change needed

---

### Win/Loss Streak
**Status:** Idea | **Effort:** Low

Show each player's current consecutive win or loss streak on the leaderboard and player profile (e.g. 🔥 4W or ❄️ 3L).

**Data logic:** Computed from ordered match history — no DB change needed. Walk matches from newest to oldest, count consecutive outcomes.

---

### Match Activity Feed
**Status:** Idea | **Effort:** Low

A chronological feed of recent matches on the group home page — who played, the score, and the date. Different rendering of existing match data already fetched for the group page. No new queries needed.

---

### Rivalry Tracker
**Status:** Idea | **Effort:** Low

Auto-detect the player you face most often on the opposite team. Shown on the player profile page as "Biggest rival: [Name] — faced 8 times."

**Data logic:** Pure query on `matches` — no schema change.

---

### Match Notes
**Status:** Idea | **Effort:** Low

Optional free-text note when logging a match (e.g. "Final of the Tuesday league", "Revenge match"). Shown on the match card.

**Schema change:** Add nullable `notes TEXT` column to the `matches` table.

---

### Seasons
**Status:** Idea | **Effort:** Low

Filter standings and match history by a named date range (e.g. "Summer 2025", "Season 2"). Members can browse past seasons.

**Data logic:** Filter existing `matches` by `played_at` date range — minimal or no schema change (could define seasons as just date boundaries stored client-side or in a lightweight `seasons` table).

---

### Pair Leaderboard
**Status:** Idea | **Effort:** Medium

Standings for player partnerships — how often two players win when they play together. Shows best and worst partner combinations.

**Data logic:** DB view `pair_standings` already exists in `supabase/schema.sql` — only the UI page needs to be built under `groups/[slug]/pairs`.

---

### Club Icon Picker
**Status:** Idea | **Effort:** Medium

Let the club owner pick a custom emoji to represent the club (instead of the default 🏟). Shown on the dashboard card and group header.

**Schema change:** Add nullable `icon TEXT` column to the `groups` table. Default to 🏟 if not set.

---

### Achievement Badges
**Status:** Idea | **Effort:** Medium

Auto-awarded milestone badges displayed on player profiles:
- First win
- 10 matches played
- 5-match win streak
- Club champion (top of standings)
- etc.

**Data logic:** Computed at read time from match history — no stored state or schema change needed.

---

### Tournament Mode
**Status:** Idea | **Effort:** Medium

Single or double-elimination bracket within a club for a one-off event. Matches are linked to a tournament and played out in rounds.

**Scope:** New `tournaments` and `tournament_matches` tables, bracket UI, round progression logic.

---

### Club Invite Link
**Status:** Idea | **Effort:** High

Generate a shareable link (e.g. `/join?code=abc123`) that pre-fills the club name and bypasses the password prompt — useful for onboarding new members quickly.

**Schema change:** Add `invite_code TEXT UNIQUE` column to `groups`, or a separate `invites` table for expiring/single-use tokens.

---

-- ============================================================
-- Padel Wars Club — Supabase Schema
-- Run this in the Supabase SQL editor (project > SQL Editor)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone       TEXT UNIQUE,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── groups ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  join_password TEXT NOT NULL,
  owner_id      UUID NOT NULL REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── group_members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member'
             CHECK (role IN ('owner', 'admin', 'member')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ── matches ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  team_a_p1   UUID NOT NULL REFERENCES public.profiles(id),
  team_a_p2   UUID NOT NULL REFERENCES public.profiles(id),
  team_b_p1   UUID NOT NULL REFERENCES public.profiles(id),
  team_b_p2   UUID NOT NULL REFERENCES public.profiles(id),
  winner      TEXT NOT NULL CHECK (winner IN ('team_a', 'team_b')),
  score       TEXT NOT NULL,
  played_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by  UUID NOT NULL REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    team_a_p1 <> team_a_p2 AND
    team_b_p1 <> team_b_p2 AND
    team_a_p1 <> team_b_p1 AND
    team_a_p1 <> team_b_p2 AND
    team_a_p2 <> team_b_p1 AND
    team_a_p2 <> team_b_p2
  )
);

-- ── Leaderboard view ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.individual_standings AS
WITH player_matches AS (
  SELECT group_id, team_a_p1 AS player_id, winner = 'team_a' AS won, score FROM matches
  UNION ALL
  SELECT group_id, team_a_p2, winner = 'team_a', score FROM matches
  UNION ALL
  SELECT group_id, team_b_p1, winner = 'team_b', score FROM matches
  UNION ALL
  SELECT group_id, team_b_p2, winner = 'team_b', score FROM matches
),
parsed AS (
  SELECT
    pm.group_id,
    pm.player_id,
    pm.won,
    -- parse set wins from score string (count "X-Y" pairs where X>Y for team_a or Y>X for team_b)
    pm.score
  FROM player_matches pm
)
SELECT
  p.group_id,
  p.player_id,
  pr.full_name,
  pr.avatar_url,
  COUNT(*) AS matches_played,
  COUNT(*) FILTER (WHERE p.won) AS wins,
  COUNT(*) FILTER (WHERE NOT p.won) AS losses
FROM parsed p
JOIN profiles pr ON pr.id = p.player_id
GROUP BY p.group_id, p.player_id, pr.full_name, pr.avatar_url;

-- ── Pair standings view ───────────────────────────────────────
CREATE OR REPLACE VIEW public.pair_standings AS
WITH pairs AS (
  SELECT
    group_id,
    LEAST(team_a_p1, team_a_p2) AS p1,
    GREATEST(team_a_p1, team_a_p2) AS p2,
    winner = 'team_a' AS won
  FROM matches
  UNION ALL
  SELECT
    group_id,
    LEAST(team_b_p1, team_b_p2),
    GREATEST(team_b_p1, team_b_p2),
    winner = 'team_b'
  FROM matches
)
SELECT
  pairs.group_id,
  pairs.p1 AS player1_id,
  pairs.p2 AS player2_id,
  pr1.full_name AS player1_name,
  pr2.full_name AS player2_name,
  pr1.avatar_url AS player1_avatar,
  pr2.avatar_url AS player2_avatar,
  COUNT(*) AS matches_played,
  COUNT(*) FILTER (WHERE pairs.won) AS wins,
  COUNT(*) FILTER (WHERE NOT pairs.won) AS losses
FROM pairs
JOIN profiles pr1 ON pr1.id = pairs.p1
JOIN profiles pr2 ON pr2.id = pairs.p2
GROUP BY pairs.group_id, pairs.p1, pairs.p2, pr1.full_name, pr2.full_name, pr1.avatar_url, pr2.avatar_url;

-- ============================================================
-- Row-Level Security
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- ── profiles policies ─────────────────────────────────────────
CREATE POLICY "Users can view profiles of group-mates"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (
      SELECT gm2.user_id FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── groups policies ───────────────────────────────────────────
CREATE POLICY "Members can view their groups"
  ON public.groups FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Owner can update group"
  ON public.groups FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can delete group"
  ON public.groups FOR DELETE
  USING (owner_id = auth.uid());

-- ── group_members policies ────────────────────────────────────
CREATE POLICY "Members can view group membership"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups (insert own membership)"
  ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owner/admin can update member roles"
  ON public.group_members FOR UPDATE
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owner/admin can remove members, users can leave"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ── matches policies ──────────────────────────────────────────
CREATE POLICY "Group members can view matches"
  ON public.matches FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can insert matches"
  ON public.matches FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Owner/admin can delete matches"
  ON public.matches FOR DELETE
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ── Storage bucket for avatars ────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Auth users can upload avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Auth users can update avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Auth users can delete avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

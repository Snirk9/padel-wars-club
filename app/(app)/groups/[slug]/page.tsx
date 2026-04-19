import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { StandingsTable } from "@/components/leaderboard/StandingsTable";
import { MatchCard } from "@/components/matches/MatchCard";
import { Button } from "@/components/ui/Button";
import { Plus, Settings } from "lucide-react";
import type { Role, Match, Standing } from "@/lib/types";
import { parseScore } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GroupPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("id, slug, name, description, owner_id")
    .eq("slug", slug)
    .single();

  if (!group) notFound();

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/dashboard");
  const role = membership.role as Role;
  const isAdmin = role === "owner" || role === "admin";

  // Fetch all matches with player profiles
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      team_a_p1_profile:profiles!matches_team_a_p1_fkey(id, full_name, avatar_url),
      team_a_p2_profile:profiles!matches_team_a_p2_fkey(id, full_name, avatar_url),
      team_b_p1_profile:profiles!matches_team_b_p1_fkey(id, full_name, avatar_url),
      team_b_p2_profile:profiles!matches_team_b_p2_fkey(id, full_name, avatar_url)
    `)
    .eq("group_id", group.id)
    .order("played_at", { ascending: false });

  // Fetch all members with profiles
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, role, profiles(id, full_name, avatar_url)")
    .eq("group_id", group.id);

  // Compute standings from matches
  const standings = computeStandings(matches || [], (members || []) as unknown as { user_id: string; role: string; profiles: { id: string; full_name: string; avatar_url: string | null } | null }[]);
  const recentMatches = (matches || []).slice(0, 3) as Match[];

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center gap-3 px-4 h-14">
        <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 mr-1">
          ← Clubs
        </Link>
        <h1 className="text-base font-black text-gray-900 flex-1 truncate">{group.name}</h1>
        {isAdmin && (
          <Link href={`/groups/${slug}/settings`} className="text-gray-400 hover:text-gray-700">
            <Settings className="w-5 h-5" />
          </Link>
        )}
      </header>

      <div className="px-4 pt-5 space-y-5">
        {/* Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Standings</p>
          </div>
          <StandingsTable standings={standings} currentUserId={user.id} groupSlug={slug} />
        </div>

        {/* Recent matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Matches</p>
            {(matches?.length ?? 0) > 3 && (
              <Link href={`/groups/${slug}/matches`} className="text-xs font-semibold text-sky-500">
                See all
              </Link>
            )}
          </div>
          {recentMatches.length > 0 ? (
            <div className="space-y-2">
              {recentMatches.map((match) => (
                <MatchCard key={match.id} match={match} currentUserId={user.id} groupSlug={slug} isAdmin={isAdmin} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-8 text-center">
              <p className="text-2xl mb-2">🎾</p>
              <p className="font-semibold text-gray-700 mb-1">No matches yet</p>
              <p className="text-sm text-gray-400">Log the first one and start the war.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 right-4 z-30">
        <Link href={`/groups/${slug}/matches/new`}>
          <Button size="lg" className="rounded-full shadow-lg gap-2 px-5">
            <Plus className="w-5 h-5" />
            Add Match
          </Button>
        </Link>
      </div>
    </div>
  );
}

function computeStandings(matches: Match[], members: { user_id: string; role: string; profiles: { id: string; full_name: string; avatar_url: string | null } | null }[]): Standing[] {
  const map = new Map<string, Standing>();

  // Initialize all members
  for (const m of members) {
    if (!m.profiles) continue;
    map.set(m.user_id, {
      user_id: m.user_id,
      full_name: m.profiles.full_name,
      avatar_url: m.profiles.avatar_url,
      wins: 0,
      losses: 0,
      sets_won: 0,
      sets_lost: 0,
      set_diff: 0,
      matches_played: 0,
    });
  }

  for (const match of matches) {
    const teamA = [match.team_a_p1, match.team_a_p2];
    const teamB = [match.team_b_p1, match.team_b_p2];

    const { setsWon: aWon, setsLost: aLost } = parseScore(match.score);
    const aWins = match.winner === "team_a";

    for (const pid of teamA) {
      const s = map.get(pid);
      if (!s) continue;
      s.matches_played++;
      s.sets_won += aWon;
      s.sets_lost += aLost;
      s.set_diff += aWon - aLost;
      if (aWins) s.wins++; else s.losses++;
    }
    for (const pid of teamB) {
      const s = map.get(pid);
      if (!s) continue;
      s.matches_played++;
      s.sets_won += aLost;
      s.sets_lost += aWon;
      s.set_diff += aLost - aWon;
      if (!aWins) s.wins++; else s.losses++;
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const aGameDiff = a.wins - a.losses;
    const bGameDiff = b.wins - b.losses;
    if (bGameDiff !== aGameDiff) return bGameDiff - aGameDiff;
    return b.set_diff - a.set_diff;
  });
}

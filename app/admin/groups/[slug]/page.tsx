import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { StandingsTable } from "@/components/leaderboard/StandingsTable";
import { MatchCard } from "@/components/matches/MatchCard";
import { AdminMemberPanel } from "@/components/admin/AdminMemberPanel";
import { AdminMatchSection } from "@/components/admin/AdminMatchSection";
import type { Match, Standing } from "@/lib/types";
import { parseScore } from "@/lib/utils";

const TEST_EMAIL_SUFFIX = "@padelwars.internal";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminGroupPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: group } = await admin
    .from("groups")
    .select("id, slug, name, owner_id")
    .eq("slug", slug)
    .single();

  if (!group) notFound();

  // Fetch members with profiles
  const { data: membersRaw } = await admin
    .from("group_members")
    .select("id, user_id, role, profiles(id, full_name, avatar_url)")
    .eq("group_id", group.id);

  const members = (membersRaw || []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role,
    profile: m.profiles as { id: string; full_name: string; avatar_url: string | null },
  })).filter((m) => m.profile);

  // Fetch matches
  const { data: matches } = await admin
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

  // Fetch all test players not in this group (for the add panel)
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 200 });
  const testUserIds = authUsers
    .filter((u) => u.email?.endsWith(TEST_EMAIL_SUFFIX))
    .map((u) => u.id);

  const memberIds = new Set(members.map((m) => m.user_id));
  const availableIds = testUserIds.filter((id) => !memberIds.has(id));

  let availablePlayers: { id: string; full_name: string; avatar_url: string | null }[] = [];
  if (availableIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", availableIds)
      .order("full_name");
    availablePlayers = profiles || [];
  }

  const standings = computeStandings(matches || [], members);
  const players = members.map((m) => m.profile);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← Admin
        </Link>
        <h1 className="text-2xl font-black text-gray-900 mt-1">{group.name}</h1>
        <p className="text-xs text-gray-400 mt-0.5">Test group · {members.length} members · {matches?.length ?? 0} matches</p>
      </div>

      {/* Standings */}
      <section>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Standings</p>
        <StandingsTable standings={standings} currentUserId={user.id} groupSlug={slug} />
      </section>

      {/* Add Match */}
      <section>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Match</p>
        <AdminMatchSection
          groupId={group.id}
          groupSlug={slug}
          players={players}
          currentUserId={user.id}
        />
      </section>

      {/* Recent Matches */}
      {(matches?.length ?? 0) > 0 && (
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Recent Matches
          </p>
          <div className="space-y-2">
            {(matches || []).slice(0, 5).map((match) => (
              <MatchCard
                key={match.id}
                match={match as Match}
                currentUserId={user.id}
                groupSlug={slug}
                isAdmin
              />
            ))}
          </div>
        </section>
      )}

      {/* Member management */}
      <section>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Players</p>
        <AdminMemberPanel
          groupId={group.id}
          members={members}
          availablePlayers={availablePlayers}
          adminUserId={user.id}
        />
      </section>
    </div>
  );
}

function computeStandings(
  matches: Match[],
  members: { user_id: string; profile: { id: string; full_name: string; avatar_url: string | null } }[]
): Standing[] {
  const map = new Map<string, Standing>();

  for (const m of members) {
    if (!m.profile) continue;
    map.set(m.user_id, {
      user_id: m.user_id,
      full_name: m.profile.full_name,
      avatar_url: m.profile.avatar_url,
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
    if ((b.wins - b.losses) !== (a.wins - a.losses)) return (b.wins - b.losses) - (a.wins - a.losses);
    return b.set_diff - a.set_diff;
  });
}

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { MatchCard } from "@/components/matches/MatchCard";
import { parseScore, formatDate } from "@/lib/utils";
import type { Match, Role } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string; playerId: string }>;
}

export default async function PlayerProfilePage({ params }: Props) {
  const { slug, playerId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("id, slug, name")
    .eq("slug", slug)
    .single();
  if (!group) notFound();

  const { data: myMembership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();
  if (!myMembership) redirect("/dashboard");
  const isAdmin = myMembership.role === "owner" || myMembership.role === "admin";

  const { data: membership } = await supabase
    .from("group_members")
    .select("role, joined_at, profiles(id, full_name, avatar_url, created_at)")
    .eq("group_id", group.id)
    .eq("user_id", playerId)
    .single();
  if (!membership) notFound();

  const profile = membership.profiles as unknown as { id: string; full_name: string; avatar_url: string | null; created_at: string } | null;
  if (!profile) notFound();

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
    .or(`team_a_p1.eq.${playerId},team_a_p2.eq.${playerId},team_b_p1.eq.${playerId},team_b_p2.eq.${playerId}`)
    .order("played_at", { ascending: false });

  // Compute stats
  let wins = 0, losses = 0, setDiff = 0;
  const partnerMap = new Map<string, { wins: number; name: string }>();

  for (const m of matches || []) {
    const inTeamA = m.team_a_p1 === playerId || m.team_a_p2 === playerId;
    const won = (inTeamA && m.winner === "team_a") || (!inTeamA && m.winner === "team_b");
    const { setsWon, setsLost } = parseScore(m.score);
    if (won) {
      wins++;
      setDiff += setsWon - setsLost;
    } else {
      losses++;
      setDiff -= setsWon - setsLost;
    }

    // Track partners
    const partnerId = inTeamA
      ? (m.team_a_p1 === playerId ? m.team_a_p2 : m.team_a_p1)
      : (m.team_b_p1 === playerId ? m.team_b_p2 : m.team_b_p1);

    const partnerProfile = inTeamA
      ? (m.team_a_p1 === playerId ? m.team_a_p2_profile : m.team_a_p1_profile)
      : (m.team_b_p1 === playerId ? m.team_b_p2_profile : m.team_b_p1_profile);

    const existing = partnerMap.get(partnerId) || { wins: 0, name: (partnerProfile as { full_name: string } | null)?.full_name || "?" };
    if (won) existing.wins++;
    partnerMap.set(partnerId, existing);
  }

  const bestPartner = Array.from(partnerMap.entries())
    .sort((a, b) => b[1].wins - a[1].wins)[0];

  const role = membership.role as Role;
  const isOwnProfile = playerId === user.id;

  return (
    <div className="pb-24">
      <TopBar
        title={profile.full_name}
        backHref={`/groups/${slug}/players`}
        backLabel="Players"
      />

      <div className="px-4 pt-5">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="xl" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-black text-gray-900">{profile.full_name}</h1>
            </div>
            <Badge variant={role === "owner" ? "owner" : role === "admin" ? "admin" : "member"}>
              {role}
            </Badge>
            <p className="text-xs text-gray-400 mt-1">
              Member since {formatDate(membership.joined_at)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-4 text-center">
            <p className="text-2xl font-black text-green-600">{wins}</p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Wins</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-4 text-center">
            <p className="text-2xl font-black text-red-500">{losses}</p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Losses</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-4 text-center">
            <p className={`text-2xl font-black ${setDiff > 0 ? "text-green-600" : setDiff < 0 ? "text-red-500" : "text-gray-400"}`}>
              {setDiff > 0 ? "+" : ""}{setDiff}
            </p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Diff</p>
          </div>
        </div>

        {/* Best partner */}
        {bestPartner && (
          <div className="bg-sky-50 rounded-2xl border border-sky-100 px-4 py-3 mb-5 flex items-center gap-2">
            <span className="text-sky-500">🤝</span>
            <div>
              <p className="text-xs font-bold text-sky-700">Best partner</p>
              <p className="text-sm font-semibold text-gray-900">
                {bestPartner[1].name} · {bestPartner[1].wins}W together
              </p>
            </div>
          </div>
        )}

        {/* Match history */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Match History</p>
          {matches && matches.length > 0 ? (
            <div className="space-y-2">
              {(matches as Match[]).map((m) => (
                <MatchCard key={m.id} match={m} currentUserId={playerId} groupSlug={slug} isAdmin={isAdmin} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-6 text-center">
              <p className="text-sm text-gray-400">No matches played yet in this club.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

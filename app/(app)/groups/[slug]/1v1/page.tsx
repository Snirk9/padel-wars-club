import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { ComparisonView, type ComparisonData, type PlayerOption } from "@/components/1v1/ComparisonView";
import { parseScore } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p1?: string; p2?: string }>;
}

export default async function OneVsOnePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { p1: p1Id, p2: p2Id } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("id, slug, name")
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

  const { data: membersRaw } = await supabase
    .from("group_members")
    .select("user_id, profiles(id, full_name, avatar_url)")
    .eq("group_id", group.id);

  const members: PlayerOption[] = (membersRaw || [])
    .map((m) => {
      const p = m.profiles as unknown as { id: string; full_name: string; avatar_url: string | null } | null;
      if (!p) return null;
      return { id: m.user_id, name: p.full_name, avatarUrl: p.avatar_url };
    })
    .filter((m): m is PlayerOption => m !== null);

  let comparison: ComparisonData | undefined;

  if (p1Id && p2Id && p1Id !== p2Id) {
    const { data: matchesRaw } = await supabase
      .from("matches")
      .select("id, team_a_p1, team_a_p2, team_b_p1, team_b_p2, winner, score, played_at")
      .eq("group_id", group.id)
      .order("played_at", { ascending: false });

    const matches = (matchesRaw || []) as {
      id: string;
      team_a_p1: string;
      team_a_p2: string;
      team_b_p1: string;
      team_b_p2: string;
      winner: string;
      score: string;
      played_at: string;
    }[];

    // Overall stats for p1 and p2
    const p1Stats = { wins: 0, losses: 0, matchesPlayed: 0, setDiff: 0 };
    const p2Stats = { wins: 0, losses: 0, matchesPlayed: 0, setDiff: 0 };

    for (const m of matches) {
      const teamA = [m.team_a_p1, m.team_a_p2];
      const teamB = [m.team_b_p1, m.team_b_p2];
      const { setsWon: aWon, setsLost: aLost } = parseScore(m.score);

      for (const [playerId, stats] of [[p1Id, p1Stats], [p2Id, p2Stats]] as const) {
        const inA = teamA.includes(playerId);
        const inB = teamB.includes(playerId);
        if (!inA && !inB) continue;
        stats.matchesPlayed++;
        if (inA) {
          stats.setDiff += aWon - aLost;
          if (m.winner === "team_a") stats.wins++; else stats.losses++;
        } else {
          stats.setDiff += aLost - aWon;
          if (m.winner === "team_b") stats.wins++; else stats.losses++;
        }
      }
    }

    // Head-to-head
    const h2hMatches = matches.filter((m) => {
      const aHasP1 = m.team_a_p1 === p1Id || m.team_a_p2 === p1Id;
      const bHasP1 = m.team_b_p1 === p1Id || m.team_b_p2 === p1Id;
      const aHasP2 = m.team_a_p1 === p2Id || m.team_a_p2 === p2Id;
      const bHasP2 = m.team_b_p1 === p2Id || m.team_b_p2 === p2Id;
      return (aHasP1 && bHasP2) || (bHasP1 && aHasP2);
    });

    let p1Wins = 0;
    let p2Wins = 0;
    const h2hList = h2hMatches.map((m) => {
      const p1InA = m.team_a_p1 === p1Id || m.team_a_p2 === p1Id;
      const p1Won = (p1InA && m.winner === "team_a") || (!p1InA && m.winner === "team_b");
      if (p1Won) p1Wins++; else p2Wins++;
      // Show score from p1's perspective: flip set scores if p1 was on team_b
      const displayScore = p1InA
        ? m.score
        : m.score.split(",").map((s) => { const [a, b] = s.trim().split("-"); return `${b}-${a}`; }).join(", ");
      return {
        id: m.id,
        score: displayScore,
        playedAt: m.played_at,
        winner: p1Won ? ("p1" as const) : ("p2" as const),
      };
    });

    // As partners
    const partnerMatches = matches.filter((m) => {
      const aHasBoth = [m.team_a_p1, m.team_a_p2].includes(p1Id) && [m.team_a_p1, m.team_a_p2].includes(p2Id);
      const bHasBoth = [m.team_b_p1, m.team_b_p2].includes(p1Id) && [m.team_b_p1, m.team_b_p2].includes(p2Id);
      return aHasBoth || bHasBoth;
    });

    let partnerWins = 0;
    let partnerLosses = 0;
    for (const m of partnerMatches) {
      const inA = [m.team_a_p1, m.team_a_p2].includes(p1Id);
      if ((inA && m.winner === "team_a") || (!inA && m.winner === "team_b")) partnerWins++;
      else partnerLosses++;
    }

    comparison = {
      p1Stats,
      p2Stats,
      headToHead: { p1Wins, p2Wins, matches: h2hList },
      asPartners: { wins: partnerWins, losses: partnerLosses, matchesPlayed: partnerMatches.length },
    };
  }

  return (
    <div className="pb-24">
      <TopBar title="1v1 Compare" />
      <ComparisonView
        members={members}
        groupSlug={slug}
        p1Id={p1Id}
        p2Id={p2Id}
        comparison={comparison}
      />
    </div>
  );
}

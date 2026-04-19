import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { parseScore } from "@/lib/utils";
import type { Role, Match } from "@/lib/types";
import { ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PlayersPage({ params }: Props) {
  const { slug } = await params;
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

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, role, joined_at, profiles(id, full_name, avatar_url)")
    .eq("group_id", group.id)
    .order("joined_at", { ascending: true });

  const { data: matches } = await supabase
    .from("matches")
    .select("team_a_p1, team_a_p2, team_b_p1, team_b_p2, winner, score")
    .eq("group_id", group.id);

  // Compute W/L per player
  const statsMap = new Map<string, { wins: number; losses: number }>();
  for (const m of matches || []) {
    const teamA = [m.team_a_p1, m.team_a_p2];
    const teamB = [m.team_b_p1, m.team_b_p2];
    for (const pid of teamA) {
      const s = statsMap.get(pid) || { wins: 0, losses: 0 };
      if (m.winner === "team_a") s.wins++; else s.losses++;
      statsMap.set(pid, s);
    }
    for (const pid of teamB) {
      const s = statsMap.get(pid) || { wins: 0, losses: 0 };
      if (m.winner === "team_b") s.wins++; else s.losses++;
      statsMap.set(pid, s);
    }
  }

  return (
    <div className="pb-24">
      <TopBar title="Players" />
      <div className="px-4 pt-4 space-y-2">
        {(members || []).map((m) => {
          const profile = m.profiles as unknown as { id: string; full_name: string; avatar_url: string | null } | null;
          if (!profile) return null;
          const role = m.role as Role;
          const stats = statsMap.get(m.user_id) || { wins: 0, losses: 0 };
          const isCurrentUser = m.user_id === user.id;

          return (
            <Link
              key={m.user_id}
              href={`/groups/${slug}/players/${m.user_id}`}
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 hover:border-sky-200 transition-colors"
            >
              <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 text-sm truncate">{profile.full_name}</p>
                  {isCurrentUser && (
                    <span className="text-[10px] text-sky-400 font-medium">(you)</span>
                  )}
                  <Badge variant={role === "owner" ? "owner" : role === "admin" ? "admin" : "member"}>
                    {role}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {stats.wins}W · {stats.losses}L
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

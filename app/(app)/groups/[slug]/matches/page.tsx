import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { MatchCard } from "@/components/matches/MatchCard";
import { Button } from "@/components/ui/Button";
import { Plus, Download } from "lucide-react";
import type { Match } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MatchesPage({ params }: Props) {
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
  const isAdmin = membership.role === "owner" || membership.role === "admin";

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

  return (
    <div className="pb-24">
      <TopBar
        title="Match History"
        right={
          isAdmin && matches && matches.length > 0 ? (
            <Link
              href={`/groups/${slug}/matches/export`}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Link>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 space-y-2">
        {matches && matches.length > 0 ? (
          (matches as Match[]).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              currentUserId={user.id}
              groupSlug={slug}
              isAdmin={isAdmin}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-10 text-center mt-4">
            <p className="text-3xl mb-3">🎾</p>
            <p className="font-bold text-gray-900 mb-1">No matches logged yet</p>
            <p className="text-sm text-gray-400 mb-5">
              The war hasn't started. Be the first to draw blood.
            </p>
            <Link href={`/groups/${slug}/matches/new`}>
              <Button>Log first match →</Button>
            </Link>
          </div>
        )}
      </div>

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

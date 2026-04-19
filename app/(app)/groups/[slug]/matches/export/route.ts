import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: group } = await supabase
    .from("groups")
    .select("id, name")
    .eq("slug", slug)
    .single();
  if (!group) return new NextResponse("Not found", { status: 404 });

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      played_at, score, winner,
      team_a_p1_profile:profiles!matches_team_a_p1_fkey(full_name),
      team_a_p2_profile:profiles!matches_team_a_p2_fkey(full_name),
      team_b_p1_profile:profiles!matches_team_b_p1_fkey(full_name),
      team_b_p2_profile:profiles!matches_team_b_p2_fkey(full_name)
    `)
    .eq("group_id", group.id)
    .order("played_at", { ascending: false });

  const header = "Date,Team A Player 1,Team A Player 2,Team B Player 1,Team B Player 2,Score,Winner\n";
  const rows = (matches || []).map((m) => {
    const a1 = (m.team_a_p1_profile as unknown as { full_name: string } | null)?.full_name ?? "";
    const a2 = (m.team_a_p2_profile as unknown as { full_name: string } | null)?.full_name ?? "";
    const b1 = (m.team_b_p1_profile as unknown as { full_name: string } | null)?.full_name ?? "";
    const b2 = (m.team_b_p2_profile as unknown as { full_name: string } | null)?.full_name ?? "";
    const winner = m.winner === "team_a" ? `${a1} & ${a2}` : `${b1} & ${b2}`;
    return `${m.played_at},"${a1}","${a2}","${b1}","${b2}","${m.score}","${winner}"`;
  });

  const csv = header + rows.join("\n");
  const filename = `${group.name.replace(/[^a-z0-9]/gi, "_")}_matches.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

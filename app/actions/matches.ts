"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function addMatch(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const group_id = formData.get("group_id") as string;
  const team_a_p1 = formData.get("team_a_p1") as string;
  const team_a_p2 = formData.get("team_a_p2") as string;
  const team_b_p1 = formData.get("team_b_p1") as string;
  const team_b_p2 = formData.get("team_b_p2") as string;
  const winner = formData.get("winner") as "team_a" | "team_b";
  const score = formData.get("score") as string;
  const played_at = formData.get("played_at") as string;

  const players = [team_a_p1, team_a_p2, team_b_p1, team_b_p2];
  if (new Set(players).size !== 4) return { error: "All 4 players must be different" };
  if (!winner) return { error: "Please select a winner" };
  if (!score.trim()) return { error: "Please enter the score" };

  const { error } = await supabase.from("matches").insert({
    group_id,
    team_a_p1,
    team_a_p2,
    team_b_p1,
    team_b_p2,
    winner,
    score: score.trim(),
    played_at,
    created_by: user.id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteMatch(matchId: string, groupSlug: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) return { error: error.message };
  redirect(`/groups/${groupSlug}/matches`);
}

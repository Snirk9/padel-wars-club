"use client";

import { Avatar } from "@/components/ui/Avatar";
import { cn, formatDate } from "@/lib/utils";
import type { Match } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteMatch } from "@/app/actions/matches";
import { useToast } from "@/components/ui/Toast";

interface MatchCardProps {
  match: Match;
  currentUserId: string;
  groupSlug: string;
  isAdmin: boolean;
}

export function MatchCard({ match, currentUserId, groupSlug, isAdmin }: MatchCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  const teamAWon = match.winner === "team_a";
  const p1 = match.team_a_p1_profile;
  const p2 = match.team_a_p2_profile;
  const p3 = match.team_b_p1_profile;
  const p4 = match.team_b_p2_profile;

  const currentInTeamA = match.team_a_p1 === currentUserId || match.team_a_p2 === currentUserId;
  const currentInTeamB = match.team_b_p1 === currentUserId || match.team_b_p2 === currentUserId;
  const userWon = (currentInTeamA && teamAWon) || (currentInTeamB && !teamAWon);
  const userPlayed = currentInTeamA || currentInTeamB;

  async function handleDelete() {
    const result = await deleteMatch(match.id, groupSlug);
    if (result?.error) toast(result.error, "error");
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
            {formatDate(match.played_at)}
          </span>
          {userPlayed && (
            <span
              className={cn(
                "ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full",
                userWon
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500"
              )}
            >
              {userWon ? "WIN" : "LOSS"}
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => setConfirmOpen(true)}
              className={cn(
                "text-gray-300 hover:text-red-400 transition-colors",
                userPlayed ? "ml-1" : "ml-auto"
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Team A */}
          <div className={cn("flex-1 flex flex-col items-center gap-1.5", teamAWon ? "opacity-100" : "opacity-60")}>
            <div className="flex gap-1">
              {p1 && <Avatar name={p1.full_name} avatarUrl={p1.avatar_url} size="sm" />}
              {p2 && <Avatar name={p2.full_name} avatarUrl={p2.avatar_url} size="sm" />}
            </div>
            <p className="text-[11px] font-semibold text-gray-700 text-center leading-tight">
              {p1?.full_name?.split(" ")[0]} + {p2?.full_name?.split(" ")[0]}
            </p>
          </div>

          {/* Score */}
          <div className="text-center px-2 shrink-0">
            {match.score.split(",").map((set, i) => (
              <p
                key={i}
                className={cn(
                  "text-xs font-black tabular-nums",
                  i === 0 ? "text-gray-900" : "text-gray-400"
                )}
              >
                {set.trim()}
              </p>
            ))}
          </div>

          {/* Team B */}
          <div className={cn("flex-1 flex flex-col items-center gap-1.5", !teamAWon ? "opacity-100" : "opacity-60")}>
            <div className="flex gap-1">
              {p3 && <Avatar name={p3.full_name} avatarUrl={p3.avatar_url} size="sm" />}
              {p4 && <Avatar name={p4.full_name} avatarUrl={p4.avatar_url} size="sm" />}
            </div>
            <p className="text-[11px] font-semibold text-gray-700 text-center leading-tight">
              {p3?.full_name?.split(" ")[0]} + {p4?.full_name?.split(" ")[0]}
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete match?"
        description="This will permanently remove the match and update all standings. This can't be undone."
        confirmText="Delete match"
        danger
      />
    </>
  );
}

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { Standing } from "@/lib/types";

interface StandingsTableProps {
  standings: Standing[];
  currentUserId: string;
  groupSlug: string;
}

const GRID = "grid-cols-[20px_1fr_28px_28px_36px_28px_28px_36px]";

function Diff({ value }: { value: number }) {
  return (
    <span className={cn(
      "text-xs font-semibold text-right tabular-nums",
      value > 0 && "text-win",
      value < 0 && "text-loss",
      value === 0 && "text-gray-400"
    )}>
      {value > 0 ? "+" : ""}{value}
    </span>
  );
}

const LEGEND = [
  { key: "GW", label: "Games Won" },
  { key: "GL", label: "Games Lost" },
  { key: "G+/-", label: "Game Differential" },
  { key: "SW", label: "Sets Won" },
  { key: "SL", label: "Sets Lost" },
  { key: "S+/-", label: "Set Differential" },
];

export function StandingsTable({ standings, currentUserId, groupSlug }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-6 text-center">
        <p className="text-sm text-gray-400">No players yet. Add a match to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={cn("grid gap-1 px-3 py-2 border-b border-gray-50", GRID)}>
        <span className="text-[9px] font-bold text-gray-400 uppercase text-center">#</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase">Name</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase text-right">GW</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase text-right">GL</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase text-right">G+/-</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase text-right">SW</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase text-right">SL</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase text-right">S+/-</span>
      </div>

      <div className="divide-y divide-gray-50">
        {standings.map((player, index) => {
          const isCurrentUser = player.user_id === currentUserId;
          const gameDiff = player.wins - player.losses;
          return (
            <Link
              key={player.user_id}
              href={`/groups/${groupSlug}/players/${player.user_id}`}
              className={cn(
                "grid gap-1 items-center px-3 py-2.5 transition-colors hover:bg-gray-50",
                GRID,
                isCurrentUser && "bg-sky-50/50 hover:bg-sky-50"
              )}
            >
              <span className="text-[10px] font-bold text-gray-400 text-center tabular-nums">{index + 1}</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <Avatar name={player.full_name} avatarUrl={player.avatar_url} size="xs" />
                <span className={cn(
                  "text-xs font-semibold truncate",
                  isCurrentUser ? "text-sky-600" : "text-gray-900"
                )}>
                  {player.full_name.split(" ")[0]}
                  {isCurrentUser && <span className="text-[9px] text-sky-400 ml-1 font-normal">(you)</span>}
                </span>
              </div>

              <span className="text-xs font-bold text-win text-right tabular-nums">{player.wins}</span>
              <span className="text-xs text-gray-400 text-right tabular-nums">{player.losses}</span>
              <Diff value={gameDiff} />
              <span className="text-xs font-bold text-win text-right tabular-nums">{player.sets_won}</span>
              <span className="text-xs text-gray-400 text-right tabular-nums">{player.sets_lost}</span>
              <Diff value={player.set_diff} />
            </Link>
          );
        })}
      </div>
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
      {LEGEND.map(({ key, label }) => (
        <span key={key} className="text-[10px] text-gray-400">
          <span className="font-bold text-gray-500">{key}</span> = {label}
        </span>
      ))}
    </div>
    </div>
  );
}

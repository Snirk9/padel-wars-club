"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export interface PlayerOption {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface HeadToHeadMatch {
  id: string;
  score: string;
  playedAt: string;
  winner: "p1" | "p2";
}

export interface ComparisonData {
  p1Stats: { wins: number; losses: number; matchesPlayed: number; setDiff: number };
  p2Stats: { wins: number; losses: number; matchesPlayed: number; setDiff: number };
  headToHead: { p1Wins: number; p2Wins: number; matches: HeadToHeadMatch[] };
  asPartners: { wins: number; losses: number; matchesPlayed: number };
}

interface Props {
  members: PlayerOption[];
  groupSlug: string;
  p1Id?: string;
  p2Id?: string;
  comparison?: ComparisonData;
}

export function ComparisonView({ members, groupSlug, p1Id, p2Id, comparison }: Props) {
  const router = useRouter();

  function updateParams(newP1: string, newP2: string) {
    const params = new URLSearchParams();
    if (newP1) params.set("p1", newP1);
    if (newP2) params.set("p2", newP2);
    router.replace(`/groups/${groupSlug}/1v1?${params.toString()}`);
  }

  const p1 = members.find((m) => m.id === p1Id);
  const p2 = members.find((m) => m.id === p2Id);

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      {/* Player pickers */}
      <div className="grid grid-cols-2 gap-3">
        <PlayerSelect
          label="Player 1"
          value={p1Id || ""}
          members={members}
          excludeId={p2Id}
          onChange={(v) => updateParams(v, p2Id || "")}
        />
        <PlayerSelect
          label="Player 2"
          value={p2Id || ""}
          members={members}
          excludeId={p1Id}
          onChange={(v) => updateParams(p1Id || "", v)}
        />
      </div>

      {!p1Id || !p2Id ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-10 text-center">
          <p className="text-2xl mb-2">⚔️</p>
          <p className="font-semibold text-gray-700 mb-1">Select two players</p>
          <p className="text-sm text-gray-400">Compare stats, head-to-head, and more.</p>
        </div>
      ) : comparison ? (
        <ComparisonSections p1={p1!} p2={p2!} data={comparison} />
      ) : null}
    </div>
  );
}

function PlayerSelect({
  label,
  value,
  members,
  excludeId,
  onChange,
}: {
  label: string;
  value: string;
  members: PlayerOption[];
  excludeId?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
      >
        <option value="">Select…</option>
        {members
          .filter((m) => m.id !== excludeId)
          .map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
      </select>
    </div>
  );
}

function StatRow({
  label,
  v1,
  v2,
}: {
  label: string;
  v1: number;
  v2: number;
}) {
  const p1Better = v1 > v2;
  const p2Better = v2 > v1;
  return (
    <div className="flex items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className={cn("flex-1 text-center text-sm font-bold", p1Better ? "text-sky-600" : "text-gray-700")}>
        {v1}
      </span>
      <span className="w-24 text-center text-xs text-gray-400 font-medium shrink-0">{label}</span>
      <span className={cn("flex-1 text-center text-sm font-bold", p2Better ? "text-sky-600" : "text-gray-700")}>
        {v2}
      </span>
    </div>
  );
}

function ComparisonSections({
  p1,
  p2,
  data,
}: {
  p1: PlayerOption;
  p2: PlayerOption;
  data: ComparisonData;
}) {
  const { p1Stats, p2Stats, headToHead, asPartners } = data;

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Overall Stats</p>
          {/* Headers */}
          <div className="flex items-center mb-1">
            <div className="flex-1 flex flex-col items-center gap-1">
              <Avatar name={p1.name} avatarUrl={p1.avatarUrl} size="sm" />
              <span className="text-xs font-bold text-gray-700 text-center line-clamp-1">{p1.name}</span>
            </div>
            <div className="w-24 shrink-0" />
            <div className="flex-1 flex flex-col items-center gap-1">
              <Avatar name={p2.name} avatarUrl={p2.avatarUrl} size="sm" />
              <span className="text-xs font-bold text-gray-700 text-center line-clamp-1">{p2.name}</span>
            </div>
          </div>
        </div>
        <div className="px-5 pb-4">
          <StatRow label="Wins" v1={p1Stats.wins} v2={p2Stats.wins} />
          <StatRow label="Losses" v1={p1Stats.losses} v2={p2Stats.losses} />
          <StatRow label="Played" v1={p1Stats.matchesPlayed} v2={p2Stats.matchesPlayed} />
          <StatRow
            label="Set Diff"
            v1={p1Stats.setDiff}
            v2={p2Stats.setDiff}
          />
        </div>
      </div>

      {/* Head-to-Head */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Head-to-Head</p>
        {headToHead.matches.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No matches against each other yet.</p>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">{headToHead.p1Wins}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p1.name}</p>
              </div>
              <span className="text-lg font-black text-gray-300">vs</span>
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">{headToHead.p2Wins}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p2.name}</p>
              </div>
            </div>
            <div className="space-y-2">
              {headToHead.matches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0"
                >
                  <span className={cn("font-semibold", m.winner === "p1" ? "text-sky-600" : "text-gray-400")}>
                    {p1.name.split(" ")[0]}
                  </span>
                  <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                    {m.score}
                  </span>
                  <span className={cn("font-semibold", m.winner === "p2" ? "text-sky-600" : "text-gray-400")}>
                    {p2.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* As Partners */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">As Partners</p>
        {asPartners.matchesPlayed === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">They&apos;ve never played together.</p>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-green-600">{asPartners.wins}</p>
              <p className="text-xs text-gray-400 mt-0.5">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-red-500">{asPartners.losses}</p>
              <p className="text-xs text-gray-400 mt-0.5">Losses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-700">{asPartners.matchesPlayed}</p>
              <p className="text-xs text-gray-400 mt-0.5">Together</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

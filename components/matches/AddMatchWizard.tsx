"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { addMatch } from "@/app/actions/matches";
import { useToast } from "@/components/ui/Toast";
import { Check, ChevronRight } from "lucide-react";

interface Player {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Props {
  groupId: string;
  groupSlug: string;
  players: Player[];
  currentUserId: string;
  redirectTo?: string;
}

type Step = 1 | 2 | 3 | 4;

interface ScoreSet {
  a: string;
  b: string;
}

export function AddMatchWizard({ groupId, groupSlug, players, currentUserId, redirectTo }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [sets, setSets] = useState<ScoreSet[]>([{ a: "", b: "" }]);
  const [winner, setWinner] = useState<"team_a" | "team_b" | null>(null);
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlayer = (id: string) => players.find((p) => p.id === id);
  const teamAPlayers = teamA.map(getPlayer).filter(Boolean) as Player[];
  const teamBPlayers = teamB.map(getPlayer).filter(Boolean) as Player[];

  function autoDetectWinner(currentSets: ScoreSet[]) {
    const s = currentSets[0];
    const a = parseInt(s.a), b = parseInt(s.b);
    if (!isNaN(a) && !isNaN(b)) {
      if (a > b) setWinner("team_a");
      else if (b > a) setWinner("team_b");
    }
  }

  function buildScoreString(): string {
    const s = sets[0];
    if (s.a === "" || s.b === "") return "";
    return `${s.a}-${s.b}`;
  }

  function toggleTeamA(id: string) {
    setTeamA((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  }

  function toggleTeamB(id: string) {
    setTeamB((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  }

  function updateSet(idx: number, side: "a" | "b", val: string) {
    const next = sets.map((s, i) => i === idx ? { ...s, [side]: val } : s);
    setSets(next);
    autoDetectWinner(next);
  }

  async function handleSubmit() {
    setError(null);
    const score = buildScoreString();
    if (!score) { setError("Please enter the score"); return; }
    if (!winner) { setError("Please select a winner"); return; }

    setLoading(true);
    const fd = new FormData();
    fd.append("group_id", groupId);
    fd.append("team_a_p1", teamA[0]);
    fd.append("team_a_p2", teamA[1]);
    fd.append("team_b_p1", teamB[0]);
    fd.append("team_b_p2", teamB[1]);
    fd.append("winner", winner);
    fd.append("score", score);
    fd.append("played_at", playedAt);

    const result = await addMatch(fd);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    toast("Match logged! Standings updated.", "success");
    router.push(redirectTo ?? `/groups/${groupSlug}`);
  }

  const unavailableForB = teamA;
  const unavailableForA = teamB;

  return (
    <div className="px-4 pt-4 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                step > s
                  ? "bg-sky-500 text-white"
                  : step === s
                  ? "bg-sky-500 text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              {step > s ? <Check className="w-3 h-3" /> : s}
            </div>
            {s < 4 && <div className={cn("h-0.5 flex-1", step > s ? "bg-sky-500" : "bg-gray-200")} />}
          </div>
        ))}
      </div>

      {/* Step 1: Team A */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-1">Pick Team A</h2>
          <p className="text-sm text-gray-500 mb-5">Select exactly 2 players</p>
          <div className="space-y-2">
            {players.map((p) => {
              const disabled = unavailableForA.includes(p.id);
              const selected = teamA.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => !disabled && toggleTeamA(p.id)}
                  disabled={disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left",
                    selected
                      ? "border-sky-500 bg-sky-50"
                      : disabled
                      ? "border-gray-100 bg-gray-50 opacity-40"
                      : "border-gray-200 bg-white hover:border-sky-200"
                  )}
                >
                  <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="sm" />
                  <span className="flex-1 font-semibold text-gray-900 text-sm">{p.full_name}</span>
                  {p.id === currentUserId && (
                    <span className="text-[10px] text-gray-400 font-medium">you</span>
                  )}
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6">
            <Button
              fullWidth
              size="lg"
              disabled={teamA.length !== 2}
              onClick={() => setStep(2)}
              className="gap-2"
            >
              Next: Pick Team B <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Team B */}
      {step === 2 && (
        <div>
          <div className="bg-sky-50 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <span className="text-xs text-sky-600 font-semibold">Team A:</span>
            {teamAPlayers.map((p) => (
              <span key={p.id} className="flex items-center gap-1.5">
                <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="xs" />
                <span className="text-xs font-medium text-gray-700">{p.full_name.split(" ")[0]}</span>
              </span>
            ))}
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-1">Pick Team B</h2>
          <p className="text-sm text-gray-500 mb-5">Select exactly 2 players</p>
          <div className="space-y-2">
            {players.map((p) => {
              const disabled = unavailableForB.includes(p.id);
              const selected = teamB.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => !disabled && toggleTeamB(p.id)}
                  disabled={disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left",
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : disabled
                      ? "border-gray-100 bg-gray-50 opacity-40"
                      : "border-gray-200 bg-white hover:border-blue-200"
                  )}
                >
                  <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="sm" />
                  <span className="flex-1 font-semibold text-gray-900 text-sm">{p.full_name}</span>
                  {p.id === currentUserId && (
                    <span className="text-[10px] text-gray-400 font-medium">you</span>
                  )}
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" size="lg" onClick={() => setStep(1)}>Back</Button>
            <Button
              size="lg"
              fullWidth
              disabled={teamB.length !== 2}
              onClick={() => setStep(3)}
              className="gap-2"
            >
              Next: Enter Score <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Score */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-1">Enter the Score</h2>
          <p className="text-sm text-gray-500 mb-5">Set by set. Padel rules apply.</p>

          <div className="mb-4">
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Set Score</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1 font-medium">
                    {teamAPlayers.map(p => p.full_name.split(" ")[0]).join(" & ")}
                  </p>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={sets[0].a}
                    onChange={(e) => updateSet(0, "a", e.target.value)}
                    placeholder="0"
                    className="w-full text-2xl font-black text-center text-gray-900 border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <span className="text-gray-300 font-black text-xl">–</span>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 mb-1 font-medium">
                    {teamBPlayers.map(p => p.full_name.split(" ")[0]).join(" & ")}
                  </p>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={sets[0].b}
                    onChange={(e) => updateSet(0, "b", e.target.value)}
                    placeholder="0"
                    className="w-full text-2xl font-black text-center text-gray-900 border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Winner override */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Winner</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setWinner("team_a")}
                className={cn(
                  "py-3 rounded-xl border-2 text-sm font-bold transition-all",
                  winner === "team_a"
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-gray-200 text-gray-600 hover:border-sky-200"
                )}
              >
                {teamAPlayers.map(p => p.full_name.split(" ")[0]).join(" & ")}
              </button>
              <button
                onClick={() => setWinner("team_b")}
                className={cn(
                  "py-3 rounded-xl border-2 text-sm font-bold transition-all",
                  winner === "team_b"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-blue-200"
                )}
              >
                {teamBPlayers.map(p => p.full_name.split(" ")[0]).join(" & ")}
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Match Date</label>
            <input
              type="date"
              value={playedAt}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setPlayedAt(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => setStep(2)}>Back</Button>
            <Button
              size="lg"
              fullWidth
              disabled={!winner || !buildScoreString()}
              onClick={() => setStep(4)}
              className="gap-2"
            >
              Review <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-1">Confirm Match</h2>
          <p className="text-sm text-gray-500 mb-5">Double-check before it goes on the record.</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className={cn("flex-1 text-center", winner !== "team_a" && "opacity-50")}>
                  <div className="flex justify-center gap-1 mb-2">
                    {teamAPlayers.map((p) => (
                      <Avatar key={p.id} name={p.full_name} avatarUrl={p.avatar_url} size="sm" />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    {teamAPlayers.map(p => p.full_name.split(" ")[0]).join(" + ")}
                  </p>
                  {winner === "team_a" && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">WIN</span>
                  )}
                </div>
                <div className="text-center shrink-0">
                  {buildScoreString().split(",").map((s, i) => (
                    <p key={i} className="text-sm font-black text-gray-900 tabular-nums">{s.trim()}</p>
                  ))}
                </div>
                <div className={cn("flex-1 text-center", winner !== "team_b" && "opacity-50")}>
                  <div className="flex justify-center gap-1 mb-2">
                    {teamBPlayers.map((p) => (
                      <Avatar key={p.id} name={p.full_name} avatarUrl={p.avatar_url} size="sm" />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    {teamBPlayers.map(p => p.full_name.split(" ")[0]).join(" + ")}
                  </p>
                  {winner === "team_b" && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">WIN</span>
                  )}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Date:</span>
              <span className="text-xs font-semibold text-gray-700">{playedAt}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100 mb-4">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => setStep(3)} disabled={loading}>
              Edit
            </Button>
            <Button size="lg" fullWidth onClick={handleSubmit} loading={loading}>
              Submit Match ✓
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * UI Preview page — renders all core screens with mock data.
 * Remove this file before production deployment.
 */

import Link from "next/link";
import { StandingsTable } from "@/components/leaderboard/StandingsTable";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Crown, Trophy, Plus, History, Users, Settings, ChevronRight, BarChart3 } from "lucide-react";
import type { Standing, Match } from "@/lib/types";

// ── Mock data ────────────────────────────────────────────────
const MOCK_STANDINGS: Standing[] = [
  { user_id: "1", full_name: "Marco Rossi", avatar_url: null, wins: 12, losses: 2, sets_won: 12, sets_lost: 3, set_diff: 9, matches_played: 14 },
  { user_id: "2", full_name: "Sofia Koch", avatar_url: null, wins: 10, losses: 4, sets_won: 10, sets_lost: 4, set_diff: 6, matches_played: 14 },
  { user_id: "3", full_name: "Amir Taleb", avatar_url: null, wins: 9, losses: 5, sets_won: 9, sets_lost: 6, set_diff: 3, matches_played: 14 },
  { user_id: "4", full_name: "Lena Mueller", avatar_url: null, wins: 7, losses: 7, sets_won: 7, sets_lost: 7, set_diff: 0, matches_played: 14 },
  { user_id: "5", full_name: "Josh Park", avatar_url: null, wins: 4, losses: 10, sets_won: 4, sets_lost: 9, set_diff: -5, matches_played: 14 },
  { user_id: "ME", full_name: "You (Demo)", avatar_url: null, wins: 6, losses: 8, sets_won: 6, sets_lost: 8, set_diff: -2, matches_played: 14 },
];

const MATCHES = [
  {
    id: "1", date: "Apr 17", score: "6-4",
    teamA: ["Marco R.", "Sofia K."], teamB: ["Amir T.", "Lena M."],
    winner: "team_a",
  },
  {
    id: "2", date: "Apr 14", score: "6-2",
    teamA: ["You", "Marco R."], teamB: ["Josh P.", "Sofia K."],
    winner: "team_a",
  },
  {
    id: "3", date: "Apr 10", score: "4-6",
    teamA: ["Amir T.", "Josh P."], teamB: ["You", "Lena M."],
    winner: "team_b",
  },
];

// ── Sections ─────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-8 pb-2">
      <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest border-b border-sky-100 pb-1.5">
        {children}
      </p>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <div className="bg-gray-50 min-h-screen max-w-lg mx-auto">
      <div className="sticky top-0 z-40 bg-sky-500 text-white text-center text-xs font-bold py-2 px-4">
        UI Preview — Mock Data Only · No Supabase Required
      </div>

      {/* ── Dashboard ──────────────────────────────────────── */}
      <SectionLabel>Dashboard — Your Clubs</SectionLabel>
      <div className="px-4 space-y-3 pb-2">
        <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
          <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <span className="text-xl">🏟</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-gray-900 truncate">The Racket Lords</p>
              <Badge variant="owner">owner</Badge>
            </div>
            <p className="text-xs text-gray-400">6 members · 24 matches</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
          <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <span className="text-xl">🏟</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-gray-900 truncate">Sunday Smashers</p>
              <Badge variant="member">member</Badge>
            </div>
            <p className="text-xs text-gray-400">4 members · 6 matches</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
        <Button size="lg" fullWidth className="gap-2"><Plus className="w-4 h-4" /> Create a club</Button>
        <Button size="lg" variant="outline" fullWidth>Join a club</Button>
      </div>

      {/* ── Group Dashboard ─────────────────────────────────── */}
      <SectionLabel>Group Dashboard — Standings + Recent Matches</SectionLabel>

      {/* Fake top bar */}
      <div className="sticky top-8 z-30 bg-white border-b border-gray-100 flex items-center gap-3 px-4 h-14">
        <span className="text-sm font-medium text-gray-500">← Clubs</span>
        <h1 className="text-base font-black text-gray-900 flex-1">The Racket Lords</h1>
        <Settings className="w-5 h-5 text-gray-400" />
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Standings</p>
          <StandingsTable standings={MOCK_STANDINGS} currentUserId="ME" groupSlug="demo" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Matches</p>
            <span className="text-xs font-semibold text-sky-500">See all</span>
          </div>
          <div className="space-y-2">
            {MATCHES.map((m) => {
              const youInA = m.teamA.includes("You");
              const youInB = m.teamB.includes("You");
              const youWon = (youInA && m.winner === "team_a") || (youInB && m.winner === "team_b");
              const youPlayed = youInA || youInB;
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{m.date}</span>
                    {youPlayed && (
                      <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${youWon ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {youWon ? "WIN" : "LOSS"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 text-center ${m.winner !== "team_a" ? "opacity-50" : ""}`}>
                      <div className="flex justify-center gap-1 mb-1">
                        {m.teamA.map((n) => <Avatar key={n} name={n} size="sm" />)}
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700">{m.teamA.join(" + ")}</p>
                    </div>
                    <div className="text-center px-1 shrink-0">
                      {m.score.split(",").map((s, i) => (
                        <p key={i} className={`text-xs font-black tabular-nums ${i === 0 ? "text-gray-900" : "text-gray-400"}`}>{s.trim()}</p>
                      ))}
                    </div>
                    <div className={`flex-1 text-center ${m.winner !== "team_b" ? "opacity-50" : ""}`}>
                      <div className="flex justify-center gap-1 mb-1">
                        {m.teamB.map((n) => <Avatar key={n} name={n} size="sm" />)}
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700">{m.teamB.join(" + ")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="flex justify-end px-4 mt-4">
        <Button size="lg" className="rounded-full shadow-lg gap-2 px-5">
          <Plus className="w-5 h-5" /> Add Match
        </Button>
      </div>

      {/* Fake bottom nav */}
      <div className="mx-4 mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-stretch">
          {[
            { label: "Standings", icon: BarChart3, active: true },
            { label: "Matches", icon: History, active: false },
            { label: "Players", icon: Users, active: false },
            { label: "Settings", icon: Settings, active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 text-[10px] font-semibold ${item.active ? "text-sky-500" : "text-gray-400"}`}
            >
              <item.icon className="w-5 h-5" strokeWidth={item.active ? 2.5 : 2} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Match Wizard ─────────────────────────────────── */}
      <SectionLabel>Add Match Wizard — Step 1: Pick Team A</SectionLabel>
      <div className="px-4 pt-2 space-y-3">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s === 1 ? "bg-sky-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                {s}
              </div>
              {s < 4 && <div className={`h-0.5 flex-1 ${s < 1 ? "bg-sky-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <h2 className="text-xl font-black text-gray-900">Pick Team A</h2>
        <p className="text-sm text-gray-500">Select exactly 2 players</p>
        <div className="space-y-2">
          {["Marco Rossi", "Sofia Koch", "Amir Taleb", "Lena Mueller"].map((name, i) => (
            <div key={name} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${i < 2 ? "border-sky-500 bg-sky-50" : "border-gray-200 bg-white"}`}>
              <Avatar name={name} size="sm" />
              <span className="flex-1 font-semibold text-gray-900 text-sm">{name}</span>
              {i < 2 && (
                <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <Button size="lg" fullWidth className="gap-2">Next: Pick Team B →</Button>
      </div>

      {/* ── Add Match Wizard Step 3: Score ───────────────────── */}
      <SectionLabel>Add Match Wizard — Step 3: Enter Score</SectionLabel>
      <div className="px-4 pt-2 space-y-3 pb-4">
        <h2 className="text-xl font-black text-gray-900">Enter the Score</h2>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Set Score</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 mb-1 font-medium">Marco & Sofia</p>
              <div className="w-full text-2xl font-black text-center text-gray-900 border-2 border-sky-500 rounded-xl py-2">6</div>
            </div>
            <span className="text-gray-300 font-black text-xl">–</span>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 mb-1 font-medium">Amir & Lena</p>
              <div className="w-full text-2xl font-black text-center text-gray-900 border-2 border-gray-200 rounded-xl py-2">4</div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Winner (auto-detected)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 text-center">Marco & Sofia</div>
            <div className="py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 text-center">Amir & Lena</div>
          </div>
        </div>
        <Button size="lg" fullWidth className="gap-2">Review →</Button>
      </div>

      {/* ── Player Profile ──────────────────────────────────── */}
      <SectionLabel>Player Profile</SectionLabel>
      <div className="px-4 pt-2 pb-4 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name="Marco Rossi" size="xl" />
          <div>
            <h1 className="text-xl font-black text-gray-900">Marco Rossi</h1>
            <Badge variant="owner">owner</Badge>
            <p className="text-xs text-gray-400 mt-1">Member since Jan 2026</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-4 text-center">
            <p className="text-2xl font-black text-green-600">12</p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Wins</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-4 text-center">
            <p className="text-2xl font-black text-red-500">2</p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Losses</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-4 text-center">
            <p className="text-2xl font-black text-green-600">+9</p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Diff</p>
          </div>
        </div>
        <div className="bg-sky-50 rounded-2xl border border-sky-100 px-4 py-3 flex items-center gap-2">
          <span className="text-sky-500">🤝</span>
          <div>
            <p className="text-xs font-bold text-sky-700">Best partner</p>
            <p className="text-sm font-semibold text-gray-900">Sofia Koch · 8W together</p>
          </div>
        </div>
      </div>

      {/* ── Group Settings ──────────────────────────────────── */}
      <SectionLabel>Group Settings — Admin View</SectionLabel>
      <div className="px-4 pt-2 pb-12 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Members (6)</p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { name: "Marco Rossi", role: "owner" as const },
              { name: "Sofia Koch", role: "admin" as const },
              { name: "Amir Taleb", role: "member" as const },
              { name: "Lena Mueller", role: "member" as const },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={m.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                  <Badge variant={m.role === "owner" ? "owner" : m.role === "admin" ? "admin" : "member"}>
                    {m.role}
                  </Badge>
                </div>
                {m.role !== "owner" && (
                  <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">···</button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-red-50">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Danger Zone</p>
          </div>
          <div className="px-5 py-4">
            <Button variant="danger" className="gap-2">🗑 Delete Club</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

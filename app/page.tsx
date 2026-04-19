import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PadelLogo } from "@/components/ui/PadelLogo";
import { Trophy, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2">
          <PadelLogo className="w-8 h-8" />
          <span className="font-black text-gray-900 tracking-tight">PADEL WARS</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          Log in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5">
        <div className="pt-10 pb-8">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-100 rounded-full px-3 py-1.5 text-xs font-semibold text-sky-600 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Private leagues for your crew
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight mb-4">
            Track wins.<br />
            Settle scores.<br />
            <span className="text-sky-500">Keep bragging rights real.</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-sm">
            The private padel league manager for friend groups who take the game seriously — but not themselves.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup" className="flex-1">
              <Button size="lg" fullWidth>
                Start your club →
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button size="lg" variant="outline" fullWidth>
                Log in
              </Button>
            </Link>
          </div>
        </div>

        {/* Preview cards */}
        <div className="space-y-3 pb-8">
          {/* Leaderboard preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                The Racket Lords · Standings
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {mockStandings.map((player, i) => (
                <div key={player.name} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`text-sm font-black w-5 text-center ${
                      i === 0 ? "text-sky-500" : "text-gray-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: player.color + "20", color: player.color }}
                  >
                    {player.initials}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-gray-900">
                    {player.name}
                  </span>
                  <span className="text-xs font-bold text-green-600 w-10 text-right">
                    {player.w} SW
                  </span>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {player.l} SL
                  </span>
                  <span className="text-xs font-semibold text-gray-500 w-10 text-right">
                    {player.diff > 0 ? "+" : ""}{player.diff}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Match result preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Latest Match · Apr 17
              </span>
              <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                WIN
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <div className="flex justify-center gap-1.5 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">MR</div>
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">SK</div>
                </div>
                <p className="text-xs font-semibold text-gray-700">Marco + Sofia</p>
              </div>
              <div className="text-center px-2">
                <p className="text-xs font-black text-gray-900">6–4</p>
              </div>
              <div className="flex-1 text-center">
                <div className="flex justify-center gap-1.5 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">AT</div>
                  <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-700">LM</div>
                </div>
                <p className="text-xs font-semibold text-gray-400">Amir + Lena</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 pb-12">
          {features.map((f) => (
            <div key={f.label} className="flex flex-col items-center text-center gap-2 p-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                <f.icon className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-xs font-semibold text-gray-700 leading-tight">{f.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-4 text-center">
        <p className="text-xs text-gray-400">
          Padel Wars Club · Private leagues for real competition
        </p>
      </footer>
    </div>
  );
}

const mockStandings = [
  { name: "Marco R.", initials: "MR", w: 12, l: 2, diff: +9, color: "#0EA5E9" },
  { name: "Sofia K.", initials: "SK", w: 10, l: 4, diff: +6, color: "#3B82F6" },
  { name: "Amir T.", initials: "AT", w: 9, l: 5, diff: +3, color: "#8B5CF6" },
  { name: "Lena M.", initials: "LM", w: 7, l: 7, diff: 0, color: "#EC4899" },
];

const features = [
  { label: "Private clubs", icon: Users },
  { label: "Live standings", icon: Trophy },
  { label: "Fast match entry", icon: Zap },
];


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFakePlayer, deleteFakePlayer } from "@/app/actions/admin";
import { Avatar } from "@/components/ui/Avatar";
import { Trash2 } from "lucide-react";

const FAKE_PLAYER_NAMES = [
  "Marco Rossi",
  "Sofia Koch",
  "Amir Taleb",
  "Lena Mueller",
  "Josh Park",
  "Elena Vidal",
  "Tomás Pérez",
  "Nora Hansen",
  "Kai Tanaka",
  "Priya Sharma",
];

interface Player {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Props {
  players: Player[];
}

export function AdminPlayersPanel({ players }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const existingNames = new Set(players.map((p) => p.full_name));

  async function handleAdd(name: string) {
    setLoading(name);
    await createFakePlayer(name);
    setLoading(null);
    router.refresh();
  }

  async function handleDelete(userId: string) {
    setLoading(userId);
    await deleteFakePlayer(userId);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Predefined name buttons */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Add Players</p>
        <div className="grid grid-cols-2 gap-2">
          {FAKE_PLAYER_NAMES.map((name) => {
            const added = existingNames.has(name);
            const isLoading = loading === name;
            return (
              <button
                key={name}
                onClick={() => !added && !isLoading && handleAdd(name)}
                disabled={added || isLoading}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  added
                    ? "border-green-200 bg-green-50 text-green-600 cursor-default"
                    : isLoading
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-wait"
                    : "border-gray-200 bg-white text-gray-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 cursor-pointer"
                }`}
              >
                <Avatar name={name} avatarUrl={null} size="xs" />
                <span className="truncate">{name}</span>
                {added && <span className="ml-auto text-[10px] font-bold text-green-500">✓</span>}
                {isLoading && <span className="ml-auto text-[10px] text-gray-400">...</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Existing players list */}
      {players.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Created Players</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={player.full_name} avatarUrl={player.avatar_url} size="sm" />
                <span className="flex-1 text-sm font-semibold text-gray-800">{player.full_name}</span>
                <button
                  onClick={() => handleDelete(player.id)}
                  disabled={loading === player.id}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

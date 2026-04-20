"use client";

import { useState } from "react";
import { AddMatchWizard } from "@/components/matches/AddMatchWizard";
import { Button } from "@/components/ui/Button";
import { Plus, X } from "lucide-react";

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
}

export function AdminMatchSection({ groupId, groupSlug, players, currentUserId }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2 w-full" disabled={players.length < 4}>
        <Plus className="w-4 h-4" />
        {players.length < 4 ? `Add ${4 - players.length} more player(s) to log a match` : "Add Match"}
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm pb-4">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
        <p className="text-sm font-bold text-gray-700">Log a Match</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <AddMatchWizard
        groupId={groupId}
        groupSlug={groupSlug}
        players={players}
        currentUserId={currentUserId}
        redirectTo={`/admin/groups/${groupSlug}`}
      />
    </div>
  );
}

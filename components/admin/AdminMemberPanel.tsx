"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPlayerToGroup, removePlayerFromGroup } from "@/app/actions/admin";
import { Avatar } from "@/components/ui/Avatar";
import { UserPlus, Trash2 } from "lucide-react";

interface Player {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  profile: Player;
}

interface Props {
  groupId: string;
  members: Member[];
  availablePlayers: Player[];
  adminUserId: string;
  maxMembers?: number;
}

export function AdminMemberPanel({ groupId, members, availablePlayers, adminUserId, maxMembers = 11 }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const atMax = members.length >= maxMembers;

  async function handleAdd(userId: string) {
    setLoading(userId);
    await addPlayerToGroup(groupId, userId);
    setLoading(null);
    router.refresh();
  }

  async function handleRemove(memberId: string) {
    setLoading(memberId);
    await removePlayerFromGroup(memberId);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Current members */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Members ({members.length}/{maxMembers})
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={m.profile.full_name} avatarUrl={m.profile.avatar_url} size="sm" />
              <span className="flex-1 text-sm font-semibold text-gray-800">{m.profile.full_name}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">{m.role}</span>
              {m.user_id !== adminUserId && (
                <button
                  onClick={() => handleRemove(m.id)}
                  disabled={loading === m.id}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add players */}
      {availablePlayers.length > 0 && !atMax && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Add to Group</p>
          <div className="space-y-2">
            {availablePlayers.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAdd(p.id)}
                disabled={loading === p.id}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50 transition-all text-left"
              >
                <Avatar name={p.full_name} avatarUrl={p.avatar_url} size="sm" />
                <span className="flex-1 text-sm font-semibold text-gray-700">{p.full_name}</span>
                <UserPlus className="w-4 h-4 text-sky-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {atMax && (
        <p className="text-xs text-gray-400 text-center">Max {maxMembers} players reached.</p>
      )}
    </div>
  );
}

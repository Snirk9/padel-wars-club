"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  updateGroup,
  deleteGroup,
  updateMemberRole,
  removeMember,
  transferOwnership,
  changeGroupPassword,
} from "@/app/actions/groups";
import { MoreHorizontal, Trash2, ShieldCheck, ShieldOff, ArrowRightLeft, Download, Eye, EyeOff } from "lucide-react";
import type { Role } from "@/lib/types";

export interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: { id: string; full_name: string; avatar_url: string | null } | null;
}

interface Props {
  group: { id: string; slug: string; name: string; description: string | null; owner_id: string };
  members: Member[];
  currentUserId: string;
  currentRole: Role;
}

export function GroupSettingsPanel({ group, members, currentUserId, currentRole }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [editName, setEditName] = useState(group.name);
  const [editDesc, setEditDesc] = useState(group.description || "");
  const [savingInfo, setSavingInfo] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberActionsId, setMemberActionsId] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<Member | null>(null);

  const isOwner = currentRole === "owner";

  async function saveInfo() {
    setSavingInfo(true);
    const fd = new FormData();
    fd.append("name", editName);
    fd.append("description", editDesc);
    const result = await updateGroup(group.id, fd);
    setSavingInfo(false);
    if (result?.error) toast(result.error, "error");
    else { toast("Club info updated"); router.refresh(); }
  }

  async function savePassword() {
    setSavingPassword(true);
    const result = await changeGroupPassword(group.id, newPassword);
    setSavingPassword(false);
    if (result?.error) toast(result.error, "error");
    else { toast("Join password updated"); setNewPassword(""); }
  }

  async function handleDelete() {
    await deleteGroup(group.id);
  }

  async function promoteToAdmin(member: Member) {
    const result = await updateMemberRole(member.id, "admin");
    if (result?.error) toast(result.error, "error");
    else { toast(`${member.profiles?.full_name} is now an admin`); router.refresh(); }
  }

  async function demoteToMember(member: Member) {
    const result = await updateMemberRole(member.id, "member");
    if (result?.error) toast(result.error, "error");
    else { toast(`${member.profiles?.full_name} is now a member`); router.refresh(); }
  }

  async function handleRemove(member: Member) {
    const result = await removeMember(member.id);
    if (result?.error) toast(result.error, "error");
    else { toast(`${member.profiles?.full_name} removed from club`); router.refresh(); }
  }

  async function handleTransfer() {
    if (!transferTarget) return;
    const result = await transferOwnership(group.id, transferTarget.user_id, currentUserId);
    if (result?.error) toast(result.error, "error");
    else { toast("Ownership transferred"); router.refresh(); }
  }

  const nonOwnerMembers = members.filter((m) => m.user_id !== currentUserId && m.role !== "owner");

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Club info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Club Info</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Input
            label="Club Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            disabled={!isOwner}
          />
          <Input
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Sunday warriors. No mercy."
          />
          <Button onClick={saveInfo} loading={savingInfo} disabled={!editName.trim()}>
            Save changes
          </Button>
        </div>
      </div>

      {/* Join Password — owner only */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Join Password</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-gray-400">Passwords are stored securely and can't be shown. Set a new one below — existing members stay in the club.</p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New join password"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-sky-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button onClick={savePassword} loading={savingPassword} disabled={newPassword.length < 4}>
              Update password
            </Button>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Members ({members.length})
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {members.map((m) => {
            const profile = m.profiles;
            if (!profile) return null;
            const isSelf = m.user_id === currentUserId;
            const memberRole = m.role as Role;

            return (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{profile.full_name}</p>
                    {isSelf && <span className="text-[10px] text-sky-400">(you)</span>}
                  </div>
                  <Badge variant={memberRole === "owner" ? "owner" : memberRole === "admin" ? "admin" : "member"}>
                    {memberRole}
                  </Badge>
                </div>
                {!isSelf && memberRole !== "owner" && (
                  <div className="relative">
                    <button
                      onClick={() => setMemberActionsId(memberActionsId === m.id ? null : m.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {memberActionsId === m.id && (
                      <div className="absolute right-0 top-9 bg-white rounded-xl border border-gray-100 shadow-lg z-10 w-44 py-1">
                        {memberRole === "member" ? (
                          <button
                            onClick={() => { promoteToAdmin(m); setMemberActionsId(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Make Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => { demoteToMember(m); setMemberActionsId(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ShieldOff className="w-3.5 h-3.5" /> Remove Admin
                          </button>
                        )}
                        {isOwner && (
                          <button
                            onClick={() => { setTransferTarget(m); setTransferOpen(true); setMemberActionsId(null); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Ownership
                          </button>
                        )}
                        <button
                          onClick={() => { handleRemove(m); setMemberActionsId(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Export */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data</p>
        </div>
        <div className="px-5 py-4">
          <a href={`/groups/${group.slug}/matches/export`} download>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Match History (CSV)
            </Button>
          </a>
        </div>
      </div>

      {/* Danger zone */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-red-50">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Danger Zone</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-500 mb-3">
              Permanently delete this club, all its matches, and all member data. There is no undo.
            </p>
            <Button variant="danger" onClick={() => setDeleteOpen(true)} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Club
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this club?"
        description={`This will permanently delete "${group.name}", all its matches, and remove all members. This cannot be undone.`}
        confirmText="Delete forever"
        requireTyping={group.name}
        danger
      />

      <Modal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Transfer Ownership"
      >
        {transferTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              You are about to transfer ownership of <strong>{group.name}</strong> to{" "}
              <strong>{transferTarget.profiles?.full_name}</strong>. You will be demoted to Admin.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setTransferOpen(false)}>
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={() => { handleTransfer(); setTransferOpen(false); }}
              >
                Transfer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

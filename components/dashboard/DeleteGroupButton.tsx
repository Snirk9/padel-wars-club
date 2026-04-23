"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteGroup } from "@/app/actions/groups";

export function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="px-3 py-4 text-gray-300 hover:text-red-500 transition-colors shrink-0"
        aria-label="Delete club"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={async () => { await deleteGroup(groupId); }}
        title="Delete club"
        description={`This will permanently delete "${groupName}" and all its matches. This cannot be undone.`}
        confirmText="Delete"
        requireTyping={groupName}
        danger
      />
    </>
  );
}

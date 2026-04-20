"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestGroup } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function AdminGroupForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    const result = await createTestGroup(fd);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    setName("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" /> New Test Group
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="text-sm font-bold text-gray-700">Create Test Group</p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Group name"
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => { setOpen(false); setError(null); }}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={loading} disabled={name.trim().length < 2}>
          Create
        </Button>
      </div>
    </form>
  );
}

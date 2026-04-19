"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { joinGroup } from "@/app/actions/groups";
import { useState } from "react";

export function JoinGroupForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await joinGroup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        name="group_name"
        label="Club Name"
        placeholder="The Racket Lords"
        required
      />
      <Input
        name="password"
        label="Join Password"
        type="password"
        placeholder="Ask your crew"
        required
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
        Join club →
      </Button>
    </form>
  );
}

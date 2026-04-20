"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createGroup } from "@/app/actions/groups";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function CreateGroupForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createGroup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        name="name"
        label="Club Name"
        placeholder="The Racket Lords"
        required
        minLength={2}
        maxLength={50}
      />
      <Input
        name="description"
        label="Description (optional)"
        placeholder="Sunday warriors. No mercy."
        maxLength={120}
      />
      <Input
        name="password"
        label="Join Password"
        type={showPassword ? "text" : "password"}
        placeholder="Share this with your crew"
        required
        minLength={4}
        hint="Players need this to join your club"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
        Create club →
      </Button>
    </form>
  );
}

"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signUp } from "@/app/actions/auth";
import { useState } from "react";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        name="full_name"
        label="Full Name"
        placeholder="Marco Rossi"
        required
        autoComplete="name"
      />
      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="marco@example.com"
        required
        autoComplete="email"
      />
      <Input
        name="phone"
        label="Phone Number"
        type="tel"
        placeholder="+34 600 000 000"
        autoComplete="tel"
        hint="Used to prevent duplicate accounts"
      />
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        required
        minLength={8}
        autoComplete="new-password"
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
        Create account →
      </Button>
    </form>
  );
}

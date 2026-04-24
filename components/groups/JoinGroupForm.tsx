"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { joinGroup, getUnjoinedGroups } from "@/app/actions/groups";
import { useState, useEffect, useRef } from "react";

interface Club {
  id: string;
  name: string;
  slug: string;
}

export function JoinGroupForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allGroups, setAllGroups] = useState<Club[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUnjoinedGroups().then(setAllGroups);
  }, []);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const filtered = query.length > 0
    ? allGroups.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setSelectedFromDropdown(false);
    setShowDropdown(true);
  }

  function handleSelect(club: Club) {
    setQuery(club.name);
    setSelectedFromDropdown(true);
    setShowDropdown(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") setShowDropdown(false);
  }

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
      <div ref={wrapperRef} className="relative">
        <Input
          name="group_name"
          label="Club Name"
          placeholder="Start typing to find a club…"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (filtered.length > 0) setShowDropdown(true); }}
          autoComplete="off"
          required
        />
        {showDropdown && filtered.length > 0 && !selectedFromDropdown && (
          <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
            {filtered.map((club) => (
              <li
                key={club.id}
                onMouseDown={() => handleSelect(club)}
                className="px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 cursor-pointer first:rounded-t-xl last:rounded-b-xl"
              >
                {club.name}
              </li>
            ))}
          </ul>
        )}
      </div>
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

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isValidSetScore(a: number, b: number): boolean {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  if (hi === 6) return lo <= 4;          // 6-0 … 6-4
  if (hi === 7) return lo === 5 || lo === 6; // 7-5 or 7-6
  return false;
}

export function parseScore(score: string): { setsWon: number; setsLost: number } {
  const sets = score.split(",").map((s) => s.trim());
  let aTotal = 0;
  let bTotal = 0;
  for (const set of sets) {
    const [a, b] = set.split("-").map(Number);
    if (isNaN(a) || isNaN(b)) continue;
    aTotal += a;
    bTotal += b;
  }
  return { setsWon: aTotal, setsLost: bTotal };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function rankOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

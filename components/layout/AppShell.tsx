import Link from "next/link";
import { CircleUser } from "lucide-react";
import { type ReactNode } from "react";
import { PadelLogo } from "@/components/ui/PadelLogo";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <PadelLogo className="w-7 h-7" />
          <span className="font-black text-gray-900 tracking-tight text-base">
            PADEL WARS
          </span>
        </Link>
        <Link
          href="/account"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <CircleUser className="w-5 h-5" />
        </Link>
      </header>
      <main className="max-w-lg mx-auto">{children}</main>
    </div>
  );
}


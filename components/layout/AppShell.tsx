import Link from "next/link";
import { House } from "lucide-react";
import { type ReactNode } from "react";
import { PadelLogo } from "@/components/ui/PadelLogo";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { createClient } from "@/lib/supabase/server";

interface AppShellProps {
  children: ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { full_name: string; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <PadelLogo className="w-7 h-7" />
            <span className="font-black text-gray-900 tracking-tight text-base">
              PADEL WARS
            </span>
          </Link>
          <Link href="/" aria-label="Home" className="flex items-center text-gray-400 hover:text-gray-700 transition-colors">
            <House className="w-5 h-5" />
          </Link>
        </div>
        <ProfileMenu
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </header>
      <main className="max-w-lg mx-auto">{children}</main>
    </div>
  );
}


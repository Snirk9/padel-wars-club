import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteGroupButton } from "@/components/dashboard/DeleteGroupButton";
import { Users, ChevronRight, PlusCircle, LogIn } from "lucide-react";
import type { Role } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: memberships } = await supabase
    .from("group_members")
    .select(`
      role,
      groups (
        id, slug, name, description, owner_id,
        group_members (count),
        matches (count)
      )
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const firstName = profile?.full_name?.split(" ")[0] || "Player";
  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  return (
    <AppShell>
      <div className="px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-gray-400 font-medium mb-0.5">Welcome back</p>
          <h1 className="text-2xl font-black text-gray-900">{firstName} 👋</h1>
        </div>

        {memberships && memberships.length > 0 ? (
          <div className="space-y-3 mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your clubs</p>
            {memberships.map((m) => {
              const group = m.groups as unknown as {
                id: string; slug: string; name: string; description: string | null;
                owner_id: string;
                group_members: { count: number }[];
                matches: { count: number }[];
              };
              if (!group) return null;
              const memberCount = group.group_members?.[0]?.count ?? 0;
              const matchCount = group.matches?.[0]?.count ?? 0;
              const role = m.role as Role;
              const isTestGroup = group.description?.startsWith("[ADMIN_TEST] ") ?? false;

              return (
                <div
                  key={group.id}
                  className="flex items-center bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all overflow-hidden"
                >
                  <Link
                    href={`/groups/${group.slug}`}
                    className="flex items-center gap-4 flex-1 px-4 py-4 min-w-0"
                  >
                    <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                      <span className="text-xl">🏟</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-bold text-gray-900 truncate">{group.name}</p>
                        {(role === "owner" || role === "admin") && (
                          <Badge variant={role === "owner" ? "owner" : "admin"}>
                            {role}
                          </Badge>
                        )}
                        {isAdmin && isTestGroup && (
                          <Badge variant="test">TEST</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {memberCount} {memberCount === 1 ? "member" : "members"} · {matchCount} {matchCount === 1 ? "match" : "matches"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </Link>
                  {role === "owner" && (
                    <DeleteGroupButton groupId={group.id} groupName={group.name} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-sky-50 rounded-2xl border border-sky-100 px-5 py-6 mb-6 text-center">
            <p className="text-2xl mb-2">🎾</p>
            <p className="font-bold text-gray-900 mb-1">No clubs yet</p>
            <p className="text-sm text-gray-500">Create one or join a friend's club to start tracking.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/groups/new">
            <Button size="lg" fullWidth className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Create a club
            </Button>
          </Link>
          <Link href="/groups/join">
            <Button size="lg" variant="outline" fullWidth className="gap-2">
              <LogIn className="w-4 h-4" />
              Join a club
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

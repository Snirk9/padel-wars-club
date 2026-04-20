import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { AdminGroupForm } from "@/components/admin/AdminGroupForm";
import { AdminPlayersPanel } from "@/components/admin/AdminPlayersPanel";
import { ChevronRight, Users } from "lucide-react";

const TEST_EMAIL_SUFFIX = "@padelwars.internal";
const TEST_GROUP_PREFIX = "[ADMIN_TEST]";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  // Fetch test groups (owned by admin with test prefix in description)
  const { data: allGroups } = await admin
    .from("groups")
    .select("id, slug, name, description, owner_id, created_at")
    .eq("owner_id", user!.id)
    .ilike("description", `${TEST_GROUP_PREFIX}%`)
    .order("created_at", { ascending: false });

  // Fetch member counts for each group
  const groups = await Promise.all(
    (allGroups || []).map(async (g) => {
      const { count } = await admin
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", g.id);
      const { count: matchCount } = await admin
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("group_id", g.id);
      return { ...g, member_count: count ?? 0, match_count: matchCount ?? 0 };
    })
  );

  // Fetch all test players (by email suffix via admin auth API)
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 200 });
  const testUserIds = authUsers
    .filter((u) => u.email?.endsWith(TEST_EMAIL_SUFFIX))
    .map((u) => u.id);

  let testPlayers: { id: string; full_name: string; avatar_url: string | null }[] = [];
  if (testUserIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", testUserIds)
      .order("full_name");
    testPlayers = profiles || [];
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Admin Panel</h1>
        <p className="text-sm text-gray-400">Test environment — isolated from real clubs.</p>
      </div>

      {/* Test Groups */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-gray-800">Test Groups</h2>
          <AdminGroupForm />
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-8 text-center">
            <p className="text-2xl mb-2">🏟️</p>
            <p className="text-sm font-semibold text-gray-600">No test groups yet</p>
            <p className="text-xs text-gray-400 mt-1">Create one to start testing.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/admin/groups/${g.slug}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 hover:border-sky-200 hover:bg-sky-50/30 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg shrink-0">
                  🏓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{g.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3" />
                    {g.member_count} members · {g.match_count} matches
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Test Players */}
      <section className="space-y-4">
        <h2 className="text-base font-black text-gray-800">Test Players</h2>
        <AdminPlayersPanel players={testPlayers} />
      </section>
    </div>
  );
}

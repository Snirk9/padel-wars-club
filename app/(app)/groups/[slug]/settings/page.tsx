import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { GroupSettingsPanel } from "@/components/groups/GroupSettingsPanel";
import type { Role } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GroupSettingsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("id, slug, name, description, owner_id")
    .eq("slug", slug)
    .single();
  if (!group) notFound();

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();
  if (!membership) redirect("/dashboard");

  const role = membership.role as Role;
  if (role !== "owner" && role !== "admin") redirect(`/groups/${slug}`);

  const { data: members } = await supabase
    .from("group_members")
    .select("id, user_id, role, joined_at, profiles(id, full_name, avatar_url)")
    .eq("group_id", group.id)
    .order("joined_at", { ascending: true });

  return (
    <div className="pb-24">
      <TopBar title="Club Settings" backHref={`/groups/${slug}`} backLabel={group.name} />
      <GroupSettingsPanel
        group={group}
        members={(members || []) as unknown as import("@/components/groups/GroupSettingsPanel").Member[]}
        currentUserId={user.id}
        currentRole={role}
      />
    </div>
  );
}

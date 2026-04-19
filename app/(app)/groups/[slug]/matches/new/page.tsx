import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { AddMatchWizard } from "@/components/matches/AddMatchWizard";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NewMatchPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("id, slug, name")
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

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(id, full_name, avatar_url)")
    .eq("group_id", group.id);

  const players = (members || [])
    .map((m) => m.profiles as unknown as { id: string; full_name: string; avatar_url: string | null } | null)
    .filter(Boolean) as { id: string; full_name: string; avatar_url: string | null }[];

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <TopBar title="Log a Match" backHref={`/groups/${slug}`} backLabel={group.name} />
      <AddMatchWizard groupId={group.id} groupSlug={group.slug} players={players} currentUserId={user.id} />
    </div>
  );
}

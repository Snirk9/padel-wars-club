import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { type ReactNode } from "react";
import type { Role } from "@/lib/types";

interface Props {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function GroupLayout({ children, params }: Props) {
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

  const isAdmin = membership.role === "owner" || membership.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <BottomNav groupSlug={slug} isAdmin={isAdmin} />
    </div>
  );
}

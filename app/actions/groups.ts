"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const password = formData.get("password") as string;

  if (!name || name.length < 2) return { error: "Group name must be at least 2 characters" };
  if (!password || password.length < 4) return { error: "Password must be at least 4 characters" };

  const slug = generateSlug(name);
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = createAdminClient();

  const { data: group, error: groupError } = await admin
    .from("groups")
    .insert({ name, description: description || null, slug, join_password: hashedPassword, owner_id: user.id })
    .select()
    .single();

  if (groupError) return { error: groupError.message };

  await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
  });

  redirect(`/groups/${group.slug}`);
}

export async function joinGroup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const groupName = (formData.get("group_name") as string).trim();
  const password = formData.get("password") as string;
  const admin = createAdminClient();

  const { data: groups } = await admin
    .from("groups")
    .select("id, slug, name, join_password")
    .ilike("name", groupName)
    .limit(5);

  if (!groups || groups.length === 0) return { error: "No club found with that name" };

  const results = await Promise.all(groups.map(g => bcrypt.compare(password, g.join_password)));
  const matchedGroup = groups.find((_, i) => results[i]) ?? null;

  if (!matchedGroup) return { error: "Incorrect club name or password" };

  const { error: memberError } = await admin.from("group_members").insert({
    group_id: matchedGroup.id,
    user_id: user.id,
    role: "member",
  });

  if (memberError) {
    if (memberError.code === "23505") return { error: "You're already a member of this club" };
    return { error: memberError.message };
  }

  redirect(`/groups/${matchedGroup.slug}`);
}

export async function getUnjoinedGroups(): Promise<{ id: string; name: string; slug: string }[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  const joinedIds = (memberships || []).map((m) => m.group_id);

  let query = admin
    .from("groups")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (joinedIds.length > 0) {
    query = query.not("id", "in", `(${joinedIds.join(",")})`);
  }

  const { data } = await query;
  return data || [];
}

export async function updateGroup(groupId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const admin = createAdminClient();

  const { error } = await admin
    .from("groups")
    .update({ name, description: description || null })
    .eq("id", groupId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function changeGroupPassword(groupId: string, newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (!newPassword || newPassword.length < 4) return { error: "Password must be at least 4 characters" };

  const admin = createAdminClient();
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const { error } = await admin
    .from("groups")
    .update({ join_password: hashedPassword })
    .eq("id", groupId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const admin = createAdminClient();

  const { error } = await admin
    .from("groups")
    .delete()
    .eq("id", groupId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function updateMemberRole(memberId: string, role: "admin" | "member") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("group_members")
    .select("group_id")
    .eq("id", memberId)
    .single();
  if (!target) return { error: "Member not found" };

  const { data: caller } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", target.group_id)
    .eq("user_id", user.id)
    .single();
  if (!caller || !["owner", "admin"].includes(caller.role)) return { error: "Not authorized" };

  const { error } = await admin.from("group_members").update({ role }).eq("id", memberId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function removeMember(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("group_members")
    .select("group_id, user_id")
    .eq("id", memberId)
    .single();
  if (!target) return { error: "Member not found" };

  // Allow self-removal OR owner/admin removing others
  if (target.user_id !== user.id) {
    const { data: caller } = await admin
      .from("group_members")
      .select("role")
      .eq("group_id", target.group_id)
      .eq("user_id", user.id)
      .single();
    if (!caller || !["owner", "admin"].includes(caller.role)) return { error: "Not authorized" };
  }

  const { error } = await admin.from("group_members").delete().eq("id", memberId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function transferOwnership(groupId: string, newOwnerId: string, currentOwnerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (user.id !== currentOwnerId) return { error: "Not authorized" };

  const admin = createAdminClient();

  const { error: e1 } = await admin
    .from("groups")
    .update({ owner_id: newOwnerId })
    .eq("id", groupId)
    .eq("owner_id", currentOwnerId);
  if (e1) return { error: e1.message };

  await admin.from("group_members").update({ role: "admin" }).eq("group_id", groupId).eq("user_id", currentOwnerId);
  await admin.from("group_members").update({ role: "owner" }).eq("group_id", groupId).eq("user_id", newOwnerId);

  return { success: true };
}

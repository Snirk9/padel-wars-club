"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

const TEST_EMAIL_SUFFIX = "@padelwars.internal";
const TEST_GROUP_PREFIX = "[ADMIN_TEST] ";

function isAdminUser(email: string | undefined): boolean {
  return email === process.env.ADMIN_EMAIL;
}

export async function createTestGroup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user.email)) return { error: "Unauthorized" };

  const name = (formData.get("name") as string).trim();
  if (!name || name.length < 2) return { error: "Name must be at least 2 characters" };

  const slug = generateSlug(name);
  const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 10);
  const admin = createAdminClient();

  const { data: group, error } = await admin
    .from("groups")
    .insert({
      name,
      slug,
      description: `${TEST_GROUP_PREFIX}${name}`,
      join_password: hashedPassword,
      owner_id: user.id,
    })
    .select("id, slug")
    .single();

  if (error) return { error: error.message };

  await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/admin");
  return { success: true, slug: group.slug };
}

export async function deleteTestGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user.email)) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("groups").delete().eq("id", groupId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function createFakePlayer(fullName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user.email)) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const slug = fullName.toLowerCase().replace(/\s+/g, "_");
  const email = `${slug}_${Date.now()}${TEST_EMAIL_SUFFIX}`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) return { error: error.message };

  // Wait briefly for trigger to create profile, then verify it exists
  await new Promise((r) => setTimeout(r, 500));
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  // If trigger didn't fire, create profile manually
  if (!profile) {
    await admin.from("profiles").insert({ id: data.user.id, full_name: fullName });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteFakePlayer(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user.email)) return { error: "Unauthorized" };

  const admin = createAdminClient();
  // Deleting the auth user cascades to profiles via ON DELETE CASCADE
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function addPlayerToGroup(groupId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user.email)) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("group_members").insert({
    group_id: groupId,
    user_id: userId,
    role: "member",
  });

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function removePlayerFromGroup(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user.email)) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("group_members").delete().eq("id", memberId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function getTestPlayers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user.email)) return [];

  const admin = createAdminClient();
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 200 });
  const testUsers = users.filter((u) => u.email?.endsWith(TEST_EMAIL_SUFFIX));
  if (testUsers.length === 0) return [];

  const ids = testUsers.map((u) => u.id);
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", ids);

  return profiles || [];
}

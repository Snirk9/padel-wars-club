"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const full_name = (formData.get("full_name") as string).trim();
  const phone = (formData.get("phone") as string).trim();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .upsert({ id: user.id, full_name, phone: phone || null });

  if (error) return { error: error.message };
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return { error: "No file provided" };
  if (file.size > 3 * 1024 * 1024) return { error: "Image must be under 3MB" };

  const ext = file.name.split(".").pop();
  const path = `${user.id}/avatar.${ext}`;
  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = admin.storage
    .from("avatars")
    .getPublicUrl(path);

  const { error: updateError } = await admin
    .from("profiles")
    .update({ avatar_url: publicUrl + `?t=${Date.now()}` })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };
  return { success: true, url: publicUrl };
}

"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function submitSuggestion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const subject = (formData.get("subject") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const isAnonymous = formData.get("is_anonymous") === "true";

  if (subject.length < 2) return { error: "Subject must be at least 2 characters" };
  if (description.length < 5) return { error: "Description must be at least 5 characters" };

  const admin = createAdminClient();
  const { error } = await admin.from("suggestions").insert({
    subject,
    description,
    is_anonymous: isAnonymous,
    user_id: isAnonymous ? null : user.id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateSuggestionStatus(
  id: string,
  status: "new" | "reviewed" | "accepted" | "rejected"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return { error: "Not authorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("suggestions").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

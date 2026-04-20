import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { AccountSettingsForm } from "@/components/auth/AccountSettingsForm";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <AppShell>
      <TopBar title="Account" backHref="/dashboard" backLabel="Dashboard" />
      <div className="px-4 py-5 max-w-lg mx-auto">
        <AccountSettingsForm
          profile={{
            id: user.id,
            full_name: profile?.full_name ?? "",
            phone: profile?.phone ?? null,
            avatar_url: profile?.avatar_url ?? null,
          }}
          email={user.email || ""}
        />
      </div>
    </AppShell>
  );
}

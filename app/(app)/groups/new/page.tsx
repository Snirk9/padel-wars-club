import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { CreateGroupForm } from "@/components/groups/CreateGroupForm";

export default function NewGroupPage() {
  return (
    <AppShell>
      <TopBar title="Create a Club" backHref="/dashboard" backLabel="Dashboard" />
      <div className="px-4 py-6 max-w-lg mx-auto">
        <p className="text-sm text-gray-500 mb-6">
          Your club, your rules. Other players can join using the password you set.
        </p>
        <CreateGroupForm />
      </div>
    </AppShell>
  );
}

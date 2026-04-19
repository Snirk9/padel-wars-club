import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";

export default function JoinGroupPage() {
  return (
    <AppShell>
      <TopBar title="Join a Club" backHref="/dashboard" backLabel="Dashboard" />
      <div className="px-4 py-6">
        <p className="text-sm text-gray-500 mb-6">
          Get the club name and password from whoever set it up, and you're in.
        </p>
        <JoinGroupForm />
      </div>
    </AppShell>
  );
}

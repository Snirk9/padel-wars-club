import { createAdminClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { updateSuggestionStatus } from "@/app/actions/suggestions";
import { formatDate } from "@/lib/utils";

type SuggestionStatus = "new" | "reviewed" | "accepted" | "rejected";

interface Suggestion {
  id: string;
  subject: string;
  description: string;
  is_anonymous: boolean;
  status: SuggestionStatus;
  created_at: string;
}

const STATUS_VARIANTS: Record<SuggestionStatus, "default" | "admin" | "win" | "loss"> = {
  new: "default",
  reviewed: "admin",
  accepted: "win",
  rejected: "loss",
};

export default async function SuggestionsPage() {
  const admin = createAdminClient();
  const { data: suggestions } = await admin
    .from("suggestions")
    .select("id, subject, description, is_anonymous, status, created_at")
    .order("created_at", { ascending: false });

  const items = (suggestions || []) as Suggestion[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Suggestions</h1>
        <p className="text-sm text-gray-400">{items.length} total</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-10 text-center">
          <p className="text-2xl mb-2">💡</p>
          <p className="text-sm font-semibold text-gray-600">No suggestions yet</p>
          <p className="text-xs text-gray-400 mt-1">They&apos;ll appear here when users submit them.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{s.subject}</p>
                    <Badge variant={STATUS_VARIANTS[s.status]}>{s.status}</Badge>
                    {s.is_anonymous && (
                      <Badge variant="default">anonymous</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.created_at)}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {s.description.length > 200
                  ? s.description.slice(0, 200) + "…"
                  : s.description}
              </p>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  const id = formData.get("id") as string;
                  const status = formData.get("status") as SuggestionStatus;
                  await updateSuggestionStatus(id, status);
                }}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="id" value={s.id} />
                <select
                  name="status"
                  defaultValue={s.status}
                  className="text-xs rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  type="submit"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-2 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  Update
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

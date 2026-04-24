"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { submitSuggestion } from "@/app/actions/suggestions";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SuggestionModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);

  function handleClose() {
    setError(null);
    setSuccess(false);
    setLoading(false);
    setIsAnonymous(true);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("is_anonymous", String(isAnonymous));
    const result = await submitSuggestion(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Share a suggestion">
      {success ? (
        <div className="py-6 text-center space-y-3">
          <p className="text-3xl">💡</p>
          <p className="font-bold text-gray-900">Thanks! We got it.</p>
          <p className="text-sm text-gray-500">We&apos;ll review your suggestion and consider it for a future update.</p>
          <Button size="lg" fullWidth onClick={handleClose} className="mt-2">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="subject"
            label="Subject"
            placeholder="e.g. Bug when logging a match, Add tournaments…"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Tell us what happened or what you'd like to see…"
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
            />
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-700">Send anonymously</p>
              <p className="text-xs text-gray-400">Your name won&apos;t be attached</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAnonymous}
              onClick={() => setIsAnonymous((v) => !v)}
              className={cn(
                "relative inline-flex w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
                isAnonymous ? "bg-sky-500" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  isAnonymous ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
            Send suggestion →
          </Button>
        </form>
      )}
    </Modal>
  );
}

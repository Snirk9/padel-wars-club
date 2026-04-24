"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { SuggestionModal } from "./SuggestionModal";

export function SuggestionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-36 right-4 z-30 w-12 h-12 rounded-full bg-amber-400 text-white shadow-lg flex items-center justify-center hover:bg-amber-500 active:scale-95 transition-all tap-highlight-none"
        aria-label="Suggest a feature or report a bug"
      >
        <Lightbulb className="w-5 h-5" />
      </button>
      <SuggestionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

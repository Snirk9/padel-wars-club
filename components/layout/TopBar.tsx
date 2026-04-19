import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { type ReactNode } from "react";

interface TopBarProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
  right?: ReactNode;
  className?: string;
}

export function TopBar({ title, backHref, backLabel, right, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center gap-3 px-4 h-14",
        className
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 -ml-1"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel || "Back"}
        </Link>
      )}
      {title && (
        <h1 className="text-base font-bold text-gray-900 flex-1 truncate">
          {title}
        </h1>
      )}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  );
}

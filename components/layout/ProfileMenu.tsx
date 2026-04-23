"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { logout } from "@/app/actions/auth";

interface Props {
  fullName: string | null;
  avatarUrl: string | null;
  isAdmin?: boolean;
}

export function ProfileMenu({ fullName, avatarUrl, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center focus:outline-none"
      >
        <Avatar name={fullName || "?"} avatarUrl={avatarUrl} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Account
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-sky-600 hover:bg-sky-50"
            >
              Admin panel
              <span className="text-[10px] bg-sky-100 text-sky-600 font-bold px-1.5 py-0.5 rounded-full">DEV</span>
            </Link>
          )}
          <button
            onClick={() => logout()}
            className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

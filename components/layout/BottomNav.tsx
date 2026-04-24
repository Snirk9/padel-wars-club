"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, History, Users, Settings, Swords } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface BottomNavProps {
  groupSlug: string;
  isAdmin: boolean;
}

export function BottomNav({ groupSlug, isAdmin }: BottomNavProps) {
  const pathname = usePathname();
  const base = `/groups/${groupSlug}`;

  const items: NavItem[] = [
    { label: "Standings", href: base, icon: BarChart3 },
    { label: "Matches", href: `${base}/matches`, icon: History },
    { label: "1v1", href: `${base}/1v1`, icon: Swords },
    { label: "Players", href: `${base}/players`, icon: Users },
    ...(isAdmin ? [{ label: "Settings", href: `${base}/settings`, icon: Settings }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === base
              ? pathname === base
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-3 text-[10px] font-semibold transition-colors tap-highlight-none",
                active
                  ? "text-sky-500"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

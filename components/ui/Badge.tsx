import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "win" | "loss" | "owner" | "admin" | "member" | "orange" | "test";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        {
          "bg-gray-100 text-gray-600": variant === "default",
          "bg-green-100 text-green-700": variant === "win",
          "bg-red-100 text-red-600": variant === "loss",
          "bg-sky-100 text-sky-700": variant === "owner" || variant === "orange",
          "bg-blue-100 text-blue-700": variant === "admin",
          "bg-gray-100 text-gray-500": variant === "member",
          "bg-amber-100 text-amber-700": variant === "test",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

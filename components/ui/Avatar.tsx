import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const colorMap = [
  "bg-sky-100 text-sky-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-yellow-100 text-yellow-700",
  "bg-teal-100 text-teal-700",
  "bg-red-100 text-red-700",
];

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colorMap.length;
  return colorMap[idx];
}

export function Avatar({ name, avatarUrl, size = "md", className }: AvatarProps) {
  const sizeClass = sizeMap[size];
  const colorClass = getColor(name);

  if (avatarUrl) {
    return (
      <div className={cn("rounded-full overflow-hidden shrink-0 relative", sizeClass, className)}>
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-bold",
        sizeClass,
        colorClass,
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}

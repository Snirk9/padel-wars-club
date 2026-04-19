"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all tap-highlight-none select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-sky-500 text-white hover:bg-sky-600 active:scale-95 focus-visible:ring-sky-500":
              variant === "primary",
            "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95 focus-visible:ring-gray-300":
              variant === "secondary",
            "text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 focus-visible:ring-gray-300":
              variant === "ghost",
            "bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 focus-visible:ring-red-300 border border-red-200":
              variant === "danger",
            "border border-gray-300 text-gray-800 hover:bg-gray-50 active:scale-95 focus-visible:ring-gray-300":
              variant === "outline",
            "text-xs px-3 py-1.5 gap-1": size === "sm",
            "text-sm px-4 py-2.5 gap-2": size === "md",
            "text-base px-6 py-3.5 gap-2": size === "lg",
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

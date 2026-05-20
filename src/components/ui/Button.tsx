// src/components/ui/Button.tsx

import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0F1F3D] text-white hover:bg-[#1A3260] border border-[#0F1F3D]",

  secondary:
    "bg-white text-[#0F1F3D] border border-[#CBD5E1] hover:bg-[#F8FAFC]",

  danger:
    "bg-[#B91C1C] text-white hover:bg-[#991B1B] border border-[#B91C1C]",

  ghost:
    "bg-transparent text-[#475569] hover:bg-[#F1F5F9] border border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const loaderSizes: Record<ButtonSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-all duration-200

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#1A3260]/20

        disabled:opacity-80
        disabled:cursor-not-allowed

        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <Loader2
          className={`${loaderSizes[size]} animate-spin`}
        />
      )}

      {children}
    </button>
  );
}
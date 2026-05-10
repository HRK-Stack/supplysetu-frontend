// src/components/ui/Badge.tsx

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant: keyof typeof badgeStyles;
}

const badgeStyles = {
  success:
    "bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]",
  warning:
    "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]",
  danger:
    "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]",
  info:
    "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
  purple:
    "bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]",
} as const;

export function Badge({ children, variant }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full
        px-2.5 py-1 text-xs font-medium
        ${badgeStyles[variant]}
      `}
    >
      {children}
    </span>
  );
}
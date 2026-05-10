// src/components/ui/Input.tsx

import { InputHTMLAttributes } from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#475569]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${id}-error`
            : helperText
            ? `${id}-helper`
            : undefined
        }
        className={`
          h-11 w-full rounded-lg border bg-white px-3 text-sm
          text-[#0F1F3D] outline-none transition-all

          placeholder:text-[#94A3B8]

          focus-visible:border-[#0F1F3D]
          focus-visible:ring-4
          focus-visible:ring-[#0F1F3D]/5

          ${
            error
              ? "border-[#B91C1C]"
              : "border-[#CBD5E1]"
          }

          disabled:cursor-not-allowed
          disabled:bg-[#F1F5F9]
          disabled:text-[#94A3B8]

          read-only:bg-[#F8FAFC]
          read-only:text-[#64748B]

          ${className}
        `}
        {...props}
      />

      {error ? (
        <p
          id={`${id}-error`}
          className="text-xs text-[#B91C1C]"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${id}-helper`}
          className="text-xs text-[#94A3B8]"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
// src/components/ui/Textarea.tsx



import { TextareaHTMLAttributes } from "react";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  id,
  maxLength,
  value,
  ...props
}: TextareaProps) {
  const characterCount =
    typeof value === "string"
      ? value.length
      : 0;

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

      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${id}-error`
            : helperText
            ? `${id}-helper`
            : undefined
        }
        maxLength={maxLength}
        className={`
          min-h-[120px] w-full rounded-lg border
          bg-white px-3 py-3 text-sm
          text-[#0F1F3D]
          outline-none transition-all

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

      <div className="flex items-center justify-between gap-4">
        <div>
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

        {maxLength && (
          <p className="text-xs text-[#94A3B8]">
            {characterCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
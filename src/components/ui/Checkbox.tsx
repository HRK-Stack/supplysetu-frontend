// src/components/ui/Checkbox.tsx

"use client";

import type {
  InputHTMLAttributes,
} from "react";

import { Check } from "lucide-react";

interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "checked" | "onChange"
  > {
  checked?: boolean;

  onCheckedChange?: (
    checked: boolean,
  ) => void;

  label?: string;

  helperText?: string;

  error?: string;
}

function cn(
  ...classes: Array<
    string | undefined | null | false
  >
) {
  return classes
    .filter(Boolean)
    .join(" ");
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  helperText,
  error,
  disabled,
  className,
  id,
  ...props
}: CheckboxProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3",

          disabled &&
            "cursor-not-allowed opacity-60",
        )}
      >
        <div className="relative mt-0.5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(
              event,
            ) => {
              onCheckedChange?.(
                event.target.checked,
              );
            }}
            className="peer sr-only"
            {...props}
          />

          <div
            className={cn(
              /*
                ===================================
                Base Styles
                ===================================
              */

              "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200",

              /*
                ===================================
                Default State
                ===================================
              */

              "border-[var(--border)] bg-[var(--white)]",

              /*
                ===================================
                Checked State
                ===================================
              */

              checked &&
                "border-[var(--amber)] bg-[var(--amber)]",

              /*
                ===================================
                Focus State
                ===================================
              */

              "peer-focus:ring-2 peer-focus:ring-[var(--amber-light)]",

              /*
                ===================================
                Error State
                ===================================
              */

              error &&
                "border-[var(--red)]",
            )}
          >
            {checked && (
              <Check
                size={14}
                className="text-white"
              />
            )}
          </div>
        </div>

        {(label ||
          helperText) && (
          <div className="flex flex-col gap-1">
            {label && (
              <span className="text-sm font-medium text-[var(--text)]">
                {label}
              </span>
            )}

            {helperText && (
              <span className="text-xs text-[var(--text2)]">
                {helperText}
              </span>
            )}
          </div>
        )}
      </label>

      {error && (
        <p className="text-xs text-[var(--red)]">
          {error}
        </p>
      )}
    </div>
  );
}
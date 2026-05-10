// src/components/ui/Select.tsx


"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;

  placeholder?: string;

  disabled?: boolean;
  error?: string;
  helperText?: string;
  label?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select option",
  disabled,
  error,
  helperText,
  label,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find(
    (option) => option.value === value
  );

  const filtered = useMemo(() => {
    return options.filter((option) =>
      option.label
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-1.5"
    >
      {label && (
        <label className="text-sm font-medium text-[#475569]">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`
          flex h-11 w-full items-center justify-between
          rounded-lg border bg-white px-3 text-sm
          transition-all

          focus-visible:outline-none
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
        `}
      >
        <span
          className={
            selected
              ? "text-[#0F1F3D]"
              : "text-[#94A3B8]"
          }
        >
          {selected?.label ?? placeholder}
        </span>

        <ChevronDown
          className={`
            h-4 w-4 text-[#64748B]
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            z-50 overflow-hidden rounded-xl
            border border-[#CBD5E1]
            bg-white shadow-lg
          "
        >
          {/* Search */}
          <div className="border-b border-[#E2E8F0] p-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                h-10 w-full rounded-lg border
                border-[#CBD5E1] px-3 text-sm

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-[#0F1F3D]/5
              "
            />
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[#94A3B8]">
                No options found
              </div>
            ) : (
              filtered.map((option) => {
                const isSelected =
                  option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`
                      flex w-full items-center
                      justify-between rounded-lg
                      px-3 py-2 text-left text-sm
                      transition-colors

                      ${
                        isSelected
                          ? `
                            bg-[#E8EDF5]
                            text-[#0F1F3D]
                          `
                          : `
                            text-[#475569]
                            hover:bg-[#F8FAFC]
                          `
                      }
                    `}
                  >
                    {option.label}

                    {isSelected && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {error ? (
        <p className="text-xs text-[#B91C1C]">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#94A3B8]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
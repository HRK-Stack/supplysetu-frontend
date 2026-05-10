// src/components/ui/Modal.tsx

"use client";

import { ReactNode, useEffect, useId } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="
          relative z-10 w-full max-w-lg
          overflow-hidden rounded-2xl
          border border-[#CBD5E1]
          bg-white shadow-xl
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        {(title) && (
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
            {title ? (
              <h2
                id={titleId}
                className="
                  font-['Syne']
                  text-lg font-semibold
                  text-[#0F1F3D]
                "
              >
                {title}
              </h2>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={onClose}
              className="
                rounded-md p-1 transition-colors
                hover:bg-[#F1F5F9]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#1A3260]/20
              "
            >
              <X className="h-5 w-5 text-[#64748B]" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-[#E2E8F0] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
// src/components/ui/Toast.tsx



"use client";

import { Toaster } from "sonner";

export function Toast() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      visibleToasts={5}
      duration={4000}
      toastOptions={{
        classNames: {
          toast: `
            rounded-xl border border-[#CBD5E1]
            bg-white text-[#0F1F3D]
            shadow-lg
          `,

          title: "font-medium text-[#0F1F3D]",

          description: "text-[#64748B]",

          actionButton:
            "bg-[#0F1F3D] text-white",

          cancelButton:
            "bg-[#F1F5F9] text-[#475569]",

          closeButton:
            "border border-[#CBD5E1] bg-white",
        },
      }}
    />
  );
}
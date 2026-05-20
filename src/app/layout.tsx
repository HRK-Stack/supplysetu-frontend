// src/app/layout.tsx
import "@/lib/initAuth"; // MUST be first — this wires api.ts ↔ authStore.ts
import React from "react";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";
import AuthBootstrap
  from "@/components/auth/AuthBootstrap";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SupplySetu",
  description: "B2B SaaS platform for Indian HEP distribution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthBootstrap />
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          richColors
        />
      </body>
    </html>
  );
}
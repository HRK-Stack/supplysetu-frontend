// src/app/layout.tsx
import "@/lib/initAuth"; // MUST be first — this wires api.ts ↔ authStore.ts
import React from "react";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
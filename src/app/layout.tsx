// src/app/layout.tsx

import React from "react";
import type { Metadata } from "next";
import "tailwindcss";

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
      <body>{children}</body>
    </html>
  );
}

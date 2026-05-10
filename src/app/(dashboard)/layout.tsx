// src/app/(dashboard)/layout.tsx

import { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import { Toast } from "@/components/ui/Toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div
      className="
        min-h-screen overflow-hidden
        bg-[#F8FAFC]
      "
    >
      <Toast />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <Topbar />

          {/* Page Content */}
          <main
            className="
              flex-1 overflow-y-auto
              p-4 md:p-6
            "
          >
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
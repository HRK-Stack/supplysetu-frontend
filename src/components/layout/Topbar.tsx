// src/components/layout/Topbar.tsx


"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  LogOut,
  Wifi,
  WifiOff,
} from "lucide-react";

import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

import { useAuthStore } from "@/store/authStore";

import api from "@/lib/api";

export function Topbar() {
  const router = useRouter();

  const { user } = useAuth();

  const { isOnline } =
    useOnlineStatus();

  const clearAuth = useAuthStore(
    (state) => state.clearAuth
  );

  const isAuthenticated =
    useAuthStore(
      (state) =>
        state.isAuthenticated
    );

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    setIsLoggingOut(true);

    if (!isOnline) {
      toast.warning(
        "You are offline. Session cleared locally."
      );
    }

    try {
      if (isOnline) {
        await api.post(
          "/auth/logout"
        );
      }

      toast.success(
        "Logged out successfully"
      );
    } catch {
      toast.error(
        "Logout request failed. Session cleared locally."
      );
    } finally {
      clearAuth();

      router.replace("/login");
    }
  };

  return (
    <header
      className="
        sticky top-0 z-30
        border-b border-[#E2E8F0]
        bg-white/90 backdrop-blur
      "
    >
      <div
        className="
          flex h-16 items-center
          justify-between gap-4
          px-4 md:px-6
        "
      >
        {/* Left */}
        <div className="min-w-0">
          <h2
            className="
              truncate font-['Syne']
              text-lg font-semibold
              text-[#0F1F3D]
            "
          >
            SupplySetu
          </h2>

          <p
            className="
              hidden text-xs
              text-[#94A3B8]
              sm:block
            "
          >
            Wholesale Management
            Platform
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Network Status */}
          <div
            className={`
              inline-flex items-center
              gap-2 rounded-full
              px-3 py-1
              text-xs font-medium

              ${
                isOnline
                  ? `
                    bg-[#DCFCE7]
                    text-[#15803D]
                  `
                  : `
                    bg-[#FEE2E2]
                    text-[#B91C1C]
                  `
              }
            `}
          >
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}

            <span className="hidden sm:inline">
              {isOnline
                ? "Online"
                : "Offline"}
            </span>
          </div>

          {/* User */}
          <div className="hidden text-right md:block">
            <p
              className="
                max-w-[160px]
                truncate text-sm
                font-medium
                text-[#0F1F3D]
              "
            >
              {user?.name ?? "User"}
            </p>

            <p
              className="
                text-xs uppercase
                tracking-wide
                text-[#94A3B8]
              "
            >
              {user?.role ?? "USER"}
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="
              inline-flex items-center
              gap-2 rounded-lg
              border border-[#CBD5E1]

              px-3 py-2
              text-sm font-medium

              text-[#475569]
              transition-colors

              hover:bg-[#F8FAFC]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#0F1F3D]/20

              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            <LogOut className="h-4 w-4" />

            <span className="hidden sm:inline">
              {isLoggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
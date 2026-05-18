// src/hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { isTokenExpired } from "@/lib/auth";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.access_token);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAuthenticated = !!token && !isTokenExpired(token);

  return {
    user,
    role,
    isAuthenticated,
    isLoading: !hydrated || !mounted,
  };
}
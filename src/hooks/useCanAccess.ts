// src/hooks/useCanAccess.ts

"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { hasPermission, type Permission } from "@/lib/auth";

/**
 * Single permission check
 */
export function useCanAccess(permission: Permission): boolean {
  const { role, isAuthenticated } = useAuthStore((s) => ({
    role: s.role,
    isAuthenticated: s.isAuthenticated,
  }));

  if (!isAuthenticated) return false;

  return hasPermission(role, permission);
}

/**
 * Multiple permissions (memoized)
 */
export function usePermissions<T extends readonly Permission[]>(
  permissions: T
): Record<T[number], boolean> {
  const role = useAuthStore((s) => s.role);

  return useMemo(() => {
    const result = {} as Record<T[number], boolean>;

    permissions.forEach((permission: T[number]) => {
      result[permission] = hasPermission(
        role,
        permission
      );
    });

    return result;
  }, [permissions, role]);
}
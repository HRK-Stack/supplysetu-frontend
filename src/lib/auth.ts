// src/lib/auth.ts

import type { JwtPayload, UserRole } from "@/types/auth";

/**
 * Safe base64 decode (handles Unicode)
 */
function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(padded);

  return decodeURIComponent(
    decoded
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Decode JWT payload (NO verification)
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const json = base64UrlDecode(parts[1]);
    const parsed = JSON.parse(json);
    // ✅ REQUIRED claims validation (FIXED)
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.sub !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.exp !== "number" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.tenant_id !== "string" ||
      typeof parsed.iss !== "string" ||
      typeof parsed.aud !== "string"
    ) {
      return null;
    }

    const validRoles = ["ADMIN", "MANAGER", "SALES_REP"];

    if (!validRoles.includes(parsed.role)) return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check token expiry (with 60s skew)
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now - 60;
}

/* =======================
   PERMISSION SYSTEM (FIXED)
======================= */

export type Permission =
  | "dealers:read"
  | "dealers:write"
  | "products:read"
  | "products:write"
  | "quotes:read"
  | "quotes:create"
  | "quotes:approve"
  | "orders:read"
  | "orders:create"
  | "schemes:manage"
  | "users:manage"
  | "territories:manage";

/* ✅ Avoid duplication */
const SALES_REP_PERMS = new Set<Permission>([
  "dealers:read",
  "products:read",
  "quotes:read",
  "quotes:create",
  "orders:read",
  "orders:create",
]);

const MANAGER_PERMS = new Set<Permission>([
  ...SALES_REP_PERMS,
  "dealers:write",
  "products:write",
  "quotes:approve",
  "schemes:manage",
]);

const ADMIN_PERMS = new Set<Permission>([
  ...MANAGER_PERMS,
  "users:manage",
  "territories:manage",
]);

const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  SALES_REP: SALES_REP_PERMS,
  MANAGER: MANAGER_PERMS,
  ADMIN: ADMIN_PERMS,
};

/**
 * Permission checker (SAFE)
 */
export function hasPermission(
  role: UserRole | null,
  permission: Permission
): boolean {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].has(permission);
}
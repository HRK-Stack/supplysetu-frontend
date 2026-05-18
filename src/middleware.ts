// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type UserRole = "ADMIN" | "MANAGER" | "SALES_REP";
interface JwtPayload {
  sub: string;
  role: UserRole;
  tenant_id: string;
  exp: number;
  iat: number;
}

function isValidRole(role: unknown): role is UserRole {
  return role === "ADMIN" || role === "MANAGER" || role === "SALES_REP";
}

function decodeJwtEdge(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const parsed = JSON.parse(atob(padded));
    if (
      typeof parsed !== "object" || parsed === null ||
      typeof parsed.sub !== "string" || typeof parsed.tenant_id !== "string" ||
      typeof parsed.exp !== "number" || !isValidRole(parsed.role)
    ) return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

function isExpiredEdge(payload: JwtPayload): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowSeconds - 60;
}

const PUBLIC_ROUTES = new Set(["/login", "/healthz"]);
const PUBLIC_PREFIXES = ["/_next/", "/favicon", "/icons/", "/images/", "/sw.js", "/manifest", "/api/v1/auth/login"];

const ADMIN_ONLY = ["/settings/users", "/settings/territories", "/settings/audit-logs"];
const MANAGER_PLUS = ["/schemes"];

function isPublic(path: string): boolean {
  if (PUBLIC_ROUTES.has(path)) return true;
  return PUBLIC_PREFIXES.some((p) => path.startsWith(p));
}
function needsAdmin(path: string): boolean {
  return ADMIN_ONLY.some((p) => path.startsWith(p));
}
function needsManager(path: string): boolean {
  return MANAGER_PLUS.some((p) => path.startsWith(p));
}
function hasRefreshToken(req: NextRequest): boolean {
  return !!req.cookies.get("refresh_token")?.value;
}
function extractToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (h?.startsWith("Bearer ")) return h.substring(7);
  return req.cookies.get("__access_token")?.value ?? null;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  // Login page: redirect already-authenticated users
  if (pathname === "/login") {
    const token = extractToken(request);
    const refreshExists = hasRefreshToken(request);

    if (token) {
      const payload = decodeJwtEdge(token);
      if (payload && !isExpiredEdge(payload)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    if (refreshExists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  const rawToken = extractToken(request);

  if (!rawToken) {
    // If refresh token exists, let the client silent-refresh on first API call
    if (hasRefreshToken(request)) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtEdge(rawToken);
  if (!payload || isExpiredEdge(payload)) {
    if (hasRefreshToken(request)) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (needsAdmin(pathname) && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (needsManager(pathname) && payload.role !== "ADMIN" && payload.role !== "MANAGER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|otf|json|xml|txt)$).*)",
  ],
};
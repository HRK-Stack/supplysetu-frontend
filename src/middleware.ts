// src/middleware.ts
// SupplySetu — Next.js Edge Middleware
//
// Runs at the edge (Vercel Edge Runtime / Next.js middleware runtime).
// CONSTRAINTS:
//   - NO Node.js APIs: no `fs`, no `path`, no `crypto` (use Web Crypto API if needed)
//   - NO Zustand store access (not available at edge)
//   - NO imports from src/lib/auth.ts or any module that uses Node builtins
//   - JWT decode is inline and uses only Web APIs (atob, JSON.parse)
//   - All redirects via NextResponse.redirect() — never window.location
//   - Token is read from the Authorization header set by the Axios client
//     OR from a non-HttpOnly __access_token cookie as a fallback for SSR pages.
//
// Authentication strategy at the edge:
//   The access token lives in Zustand memory on the client. For edge middleware
//   to read it we rely on the client setting it in a non-HttpOnly cookie called
//   `__access_token` on successful login/refresh (handled in api.ts TASK-FE-001).
//   The HttpOnly `refresh_token` cookie is NOT readable here by design.
//
// Note: the middleware only DECODES the JWT (no signature verification).
// The backend performs full RS256 validation on every API call. The middleware
// is purely a UX guard — it prevents unnecessary page renders for unauthorised
// routes and provides instant redirects without a round-trip.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Types (inlined — no external imports at edge) ───────────────────────────

type UserRole = "ADMIN" | "MANAGER" | "SALES_REP";

interface JwtPayload {
  sub: string;
  role: UserRole;
  tenant_id: string;
  exp: number;
  iat: number;
}

// ─── JWT decode (edge-safe, no Node.js APIs) ─────────────────────────────────

/**
 * Decodes the payload of a JWT using only Web APIs (atob + JSON.parse).
 * Does NOT verify the signature — the backend owns cryptographic validation.
 * Returns null on any malformed input.
 */
function isValidRole(role: unknown): role is UserRole {
  return role === "ADMIN" || role === "MANAGER" || role === "SALES_REP";
}

function decodeJwtEdge(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const parsed = JSON.parse(atob(padded));

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.sub !== "string" ||
      typeof parsed.tenant_id !== "string" ||
      typeof parsed.exp !== "number" ||
      !isValidRole(parsed.role)
    ) {
      return null;
    }

    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the token is expired.
 * Uses a 60-second clock-skew tolerance matching the backend's PyJWT leeway.
 */
function isExpiredEdge(payload: JwtPayload): boolean {
  const CLOCK_SKEW_SECONDS = 60;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowSeconds - CLOCK_SKEW_SECONDS;
}

// ─── Route configuration ─────────────────────────────────────────────────────

/** Routes that bypass all auth checks entirely. */
const PUBLIC_ROUTES: ReadonlySet<string> = new Set([
  "/login",
  "/healthz",
]);

/** Route prefixes that bypass auth checks (e.g. Next.js internals, static). */
const PUBLIC_PREFIXES: readonly string[] = [
  "/_next/",
  "/favicon",
  "/icons/",
  "/images/",
  "/sw.js",
  "/manifest",
  "/api/v1/auth/login",  // login endpoint itself is public
];

/**
 * Routes restricted to ADMIN only.
 * Any authenticated non-ADMIN user is redirected to `/`.
 */
const ADMIN_ONLY_PREFIXES: readonly string[] = [
  "/settings/users",
  "/settings/territories",
  "/settings/audit-logs",
];

/**
 * Routes restricted to MANAGER or ADMIN.
 * SALES_REP is redirected to `/`.
 */
const MANAGER_PLUS_PREFIXES: readonly string[] = [
  "/schemes",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function requiresAdminRole(pathname: string): boolean {
  return ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function requiresManagerOrAbove(pathname: string): boolean {
  return MANAGER_PLUS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Extracts the raw JWT from the request.
 *
 * Priority order:
 *   1. `Authorization: Bearer <token>` header  (set by Axios on every API call)
 *   2. `__access_token` non-HttpOnly cookie     (set by the login/refresh handler
 *      in api.ts so that middleware can read the token on page navigations)
 *
 * The `refresh_token` HttpOnly cookie is intentionally NOT readable here.
 */
function hasRefreshToken(request: NextRequest): boolean {
  return !!request.cookies.get("refresh_token")?.value;
}

function extractToken(request: NextRequest): string | null {
  // STRICT priority: Header > Cookie
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const cookieToken = request.cookies.get("__access_token")?.value;
  return cookieToken ?? null;
}

function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

function isManagerOrAbove(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ── 1. Pass through public routes without any auth check ─────────────────
  if (pathname === "/login") {
    const token = extractToken(request);

    if (token) {
      const payload = decodeJwtEdge(token);

      if (payload && !isExpiredEdge(payload)) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // If expired but refresh exists → allow app to auto-refresh
      if (hasRefreshToken(request)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  }

  // ── 2. Extract and decode the token ──────────────────────────────────────
  const rawToken = extractToken(request);

  if (!rawToken) {
    // No token at all — send to login, preserving the intended destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtEdge(rawToken);

  if (!payload || isExpiredEdge(payload)) {
  // If refresh token exists → let client handle silent refresh
    if (hasRefreshToken(request)) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = payload;

  // ── 3. ADMIN-only routes ──────────────────────────────────────────────────
  if (requiresAdminRole(pathname) && !isAdmin(role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ── 4. MANAGER-or-above routes ────────────────────────────────────────────
  if (requiresManagerOrAbove(pathname) && !isManagerOrAbove(role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ── 5. Authenticated and authorised — proceed ────────────────────────────
  return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────────────────────

/**
 * The middleware matcher tells Next.js which paths to run this file on.
 *
 * We exclude:
 *   - `/_next/static`  — static asset chunks
 *   - `/_next/image`   — Next.js image optimisation
 *   - `/favicon.ico`   — browser favicon request
 *   - `*.{ext}`        — any request for a file with an extension (images,
 *                         fonts, manifests, sw.js, etc.)
 *
 * Everything else (all page routes) passes through the middleware so we
 * can enforce auth without maintaining an explicit allowlist of protected paths.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static (static files)
     *   - _next/image (image optimisation)
     *   - favicon.ico
     *   - any path ending in a file extension (sw.js, manifest.json, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|otf|json|xml|txt)$).*)",
  ],
};

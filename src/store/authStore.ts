// src/store/authStore.ts
import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { UserRole, JwtPayload } from "@/types/auth";
import type { User } from "@/types/user";
import { injectAuthStore } from "@/lib/api";

const CLOCK_SKEW = 60;
const VALID_ROLES: UserRole[] = ["ADMIN", "MANAGER", "SALES_REP"];
const EXPECTED_ISSUER = process.env.NEXT_PUBLIC_JWT_ISSUER;
const EXPECTED_AUDIENCE = process.env.NEXT_PUBLIC_JWT_AUDIENCE;
const EMPTY_AUTH_STATE = {
  access_token: null as string | null,
  user: null as User | null,
  role: null as UserRole | null,
  tenantId: null as string | null,
  isAuthenticated: false,
  lastTokenRefreshAt: null as number | null,
};

// ─── Cookie helpers (non-HttpOnly so middleware can read them) ──────────────
function setAccessTokenCookie(token: string, maxAgeSeconds = 900) {
  if (typeof document === "undefined") return;
  document.cookie = `__access_token=${token}; path=/; SameSite=Lax; max-age=${maxAgeSeconds}`;
}
function clearAccessTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "__access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

// ─── JWT helpers ────────────────────────────────────────────────────────────
function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return decodeURIComponent(escape(atob(padded)));
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = decodeBase64Url(parts[1]);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    const required = ["iss", "aud", "sub", "tenant_id", "role", "iat", "exp"];
    if (!required.every((c) => parsed[c] != null)) return null;
    if (parsed.iss !== EXPECTED_ISSUER) return null;
    if (parsed.aud !== EXPECTED_AUDIENCE) return null;
    if (typeof parsed.tenant_id !== "string") return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.iat > now + CLOCK_SKEW || payload.exp < now - CLOCK_SKEW;
}

function deriveIsAuthenticated(token: string | null): boolean {
  return token !== null && !isTokenExpired(token);
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface AuthState {
  access_token: string | null;
  user: User | null;
  role: UserRole | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  lastTokenRefreshAt: number | null;
  setHydrated: () => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  getToken: () => string | null;
  getRole: () => UserRole | null;
  isTokenValid: () => boolean;
}

let expiryTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleTokenExpiryCheck(token: string, clearAuth: () => void): void {
  if (expiryTimeout) clearTimeout(expiryTimeout);
  const payload = decodeJwtPayload(token);
  if (!payload) { clearAuth(); return; }
  const timeout = payload.exp * 1000 - Date.now();
  if (timeout <= 0) { clearAuth(); return; }
  expiryTimeout = setTimeout(() => clearAuth(), timeout);
}

// ─── Store Creator ─────────────────────────────────────────────────────────
const authStoreCreator: StateCreator<AuthState> = (set, get) => ({
  ...EMPTY_AUTH_STATE,
  hydrated: false,

  setHydrated: () => set({ hydrated: true }),

  setToken: (token) => {
    const payload = decodeJwtPayload(token);
    console.log("[authStore] setToken payload:", payload, "EXPECTED_ISSUER:", EXPECTED_ISSUER);
    if (!payload || !VALID_ROLES.includes(payload.role)) {
      console.error("[authStore] Token rejected — clearing auth");
      clearAccessTokenCookie();
      set({ ...EMPTY_AUTH_STATE, hydrated: true });
      return;
    }
    scheduleTokenExpiryCheck(token, get().clearAuth);
    const maxAge = Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
    setAccessTokenCookie(token, maxAge);
    set((state) => ({
      ...state,
      access_token: token,
      role: payload.role,
      tenantId: payload.tenant_id,
      lastTokenRefreshAt: Date.now(),
      isAuthenticated: deriveIsAuthenticated(token),
    }));
  },

  setUser: (user) => {
    set((state) => {
      if (!state.access_token) return { ...state, user: null, isAuthenticated: false };
      const payload = decodeJwtPayload(state.access_token);
      if (!payload || payload.role !== user.role) {
        clearAccessTokenCookie();
        return { ...EMPTY_AUTH_STATE, hydrated: true };
      }
      return { ...state, user, isAuthenticated: deriveIsAuthenticated(state.access_token) };
    });
  },

  setAuth: (token, user) => {
    const payload = decodeJwtPayload(token);
    if (!payload || !VALID_ROLES.includes(payload.role) || payload.role !== user.role) {
      clearAccessTokenCookie();
      set({ ...EMPTY_AUTH_STATE, hydrated: true });
      return;
    }
    scheduleTokenExpiryCheck(token, get().clearAuth);
    const maxAge = Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
    setAccessTokenCookie(token, maxAge);
    set({
      access_token: token,
      user,
      role: payload.role,
      tenantId: payload.tenant_id,
      isAuthenticated: deriveIsAuthenticated(token),
      lastTokenRefreshAt: Date.now(),
      hydrated: true,
    });
  },

  clearAuth: () => {
    if (expiryTimeout) { clearTimeout(expiryTimeout); expiryTimeout = null; }
    clearAccessTokenCookie();
    set({ ...EMPTY_AUTH_STATE, hydrated: true });
  },

  getToken: () => get().access_token,
  getRole: () => get().role,
  isTokenValid: () => {
    const { access_token, clearAuth } = get();
    const valid = access_token !== null && !isTokenExpired(access_token);
    if (!valid) clearAuth();
    return valid;
  },
});

export const useAuthStore = create<AuthState>()(authStoreCreator);

// ═════════════════════════════════════════════════════════════════════════════
// CRITICAL: Wire the store into api.ts so interceptors can read/write tokens.
// ═════════════════════════════════════════════════════════════════════════════
injectAuthStore({
  getToken: () => useAuthStore.getState().access_token,
  setToken: (token) => useAuthStore.getState().setToken(token),
  clearAuth: () => useAuthStore.getState().clearAuth(),
});

// Memory-only store is immediately ready (no async hydration needed)
useAuthStore.getState().setHydrated();

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectToken = (state: AuthState) => state.access_token;
export const selectUser = (state: AuthState) => state.user;
export const selectRole = (state: AuthState) => state.role;
export const selectTenantId = (state: AuthState) => state.tenantId;
export const selectHydrated = (state: AuthState) => state.hydrated;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;

// ─── Non-reactive helpers ────────────────────────────────────────────────────
export const getAccessToken = (): string | null => useAuthStore.getState().access_token;
export const clearAuthState = (): void => useAuthStore.getState().clearAuth();
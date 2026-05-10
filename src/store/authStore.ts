// src/store/authStore.ts

import { create } from "zustand";

import type { StateCreator } from "zustand";

import type {
  UserRole,
  JwtPayload,
} from "@/types/auth";

import type { User } from "@/types/user";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const CLOCK_SKEW = 60;

const VALID_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "SALES_REP",
];

const EXPECTED_ISSUER =
  process.env.NEXT_PUBLIC_JWT_ISSUER;

const EXPECTED_AUDIENCE =
  process.env.NEXT_PUBLIC_JWT_AUDIENCE;

const EMPTY_AUTH_STATE = {
  access_token: null,
  user: null,
  role: null,
  tenantId: null,
  isAuthenticated: false,
  lastTokenRefreshAt: null,
};

// ─────────────────────────────────────────────────────────────
// JWT Decode Helpers
// ─────────────────────────────────────────────────────────────

function decodeBase64Url(
  value: string
): string {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64.padEnd(
    base64.length +
      ((4 - (base64.length % 4)) % 4),
    "="
  );

  return decodeURIComponent(
    escape(atob(padded))
  );
}

function decodeJwtPayload(
  token: string
): JwtPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const json = decodeBase64Url(
      parts[1]
    );

    const parsed = JSON.parse(json);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    const requiredClaims = [
      "iss",
      "aud",
      "sub",
      "tenant_id",
      "role",
      "iat",
      "exp",
    ];

    const hasClaims =
      requiredClaims.every(
        (claim) =>
          parsed[claim] !== undefined &&
          parsed[claim] !== null
      );

    if (!hasClaims) {
      return null;
    }

    if (
      parsed.iss !== EXPECTED_ISSUER
    ) {
      return null;
    }

    if (
      parsed.aud !==
      EXPECTED_AUDIENCE
    ) {
      return null;
    }

    if (
      typeof parsed.tenant_id !==
      "string"
    ) {
      return null;
    }

    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(
  token: string
): boolean {
  const payload =
    decodeJwtPayload(token);

  if (!payload) {
    return true;
  }

  const now = Math.floor(
    Date.now() / 1000
  );

  if (
    payload.iat >
    now + CLOCK_SKEW
  ) {
    return true;
  }

  return (
    payload.exp <
    now - CLOCK_SKEW
  );
}

function deriveIsAuthenticated(
  token: string | null
): boolean {
  return (
    token !== null &&
    !isTokenExpired(token)
  );
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface AuthState {
  access_token: string | null;

  user: User | null;

  role: UserRole | null;

  tenantId: string | null;

  isAuthenticated: boolean;

  hydrated: boolean;

  lastTokenRefreshAt: number | null;

  setHydrated: () => void;

  setToken: (
    token: string
  ) => void;

  setUser: (user: User) => void;

  setAuth: (
    token: string,
    user: User
  ) => void;

  clearAuth: () => void;

  getToken: () => string | null;

  getRole: () => UserRole | null;

  isTokenValid: () => boolean;
}

// ─────────────────────────────────────────────────────────────
// Expiry Cleanup
// ─────────────────────────────────────────────────────────────

let expiryTimeout:
  | ReturnType<
      typeof setTimeout
    >
  | null = null;

function scheduleTokenExpiryCheck(
  token: string,
  clearAuth: () => void
): void {
  if (expiryTimeout) {
    clearTimeout(expiryTimeout);
  }

  const payload =
    decodeJwtPayload(token);

  if (!payload) {
    clearAuth();
    return;
  }

  const expiresAt =
    payload.exp * 1000;

  const timeout =
    expiresAt - Date.now();

  if (timeout <= 0) {
    clearAuth();
    return;
  }

  expiryTimeout = setTimeout(() => {
    clearAuth();
  }, timeout);
}

// ─────────────────────────────────────────────────────────────
// Store Creator
// ─────────────────────────────────────────────────────────────

const authStoreCreator: StateCreator<
  AuthState
> = (set, get) => ({
  ...EMPTY_AUTH_STATE,

  hydrated: false,

  setHydrated: () => {
    set({
      hydrated: true,
    });
  },

  setToken: (token) => {
    const payload =
      decodeJwtPayload(token);

    if (
      !payload ||
      !VALID_ROLES.includes(
        payload.role
      )
    ) {
      set({
        ...EMPTY_AUTH_STATE,
        hydrated: true,
      });

      return;
    }

    scheduleTokenExpiryCheck(
      token,
      get().clearAuth
    );

    set((state) => ({
      ...state,

      access_token: token,

      role: payload.role,

      tenantId:
        payload.tenant_id,

      lastTokenRefreshAt:
        Date.now(),

      isAuthenticated:
        deriveIsAuthenticated(
          token
        ),
    }));
  },

  setUser: (user) => {
    set((state) => {
      if (!state.access_token) {
        return {
          ...state,
          user: null,
          isAuthenticated: false,
        };
      }

      const payload =
        decodeJwtPayload(
          state.access_token
        );

      if (
        !payload ||
        payload.role !== user.role
      ) {
        return {
          ...EMPTY_AUTH_STATE,
          hydrated: true,
        };
      }

      return {
        ...state,

        user,

        isAuthenticated:
          deriveIsAuthenticated(
            state.access_token
          ),
      };
    });
  },

  setAuth: (token, user) => {
    const payload =
      decodeJwtPayload(token);

    if (
      !payload ||
      !VALID_ROLES.includes(
        payload.role
      ) ||
      payload.role !== user.role
    ) {
      set({
        ...EMPTY_AUTH_STATE,
        hydrated: true,
      });

      return;
    }

    scheduleTokenExpiryCheck(
      token,
      get().clearAuth
    );

    set({
      access_token: token,

      user,

      role: payload.role,

      tenantId:
        payload.tenant_id,

      isAuthenticated:
        deriveIsAuthenticated(
          token
        ),

      lastTokenRefreshAt:
        Date.now(),

      hydrated: true,
    });
  },

  clearAuth: () => {
    if (expiryTimeout) {
      clearTimeout(
        expiryTimeout
      );

      expiryTimeout = null;
    }

    set({
      ...EMPTY_AUTH_STATE,
      hydrated: true,
    });
  },

  getToken: () =>
    get().access_token,

  getRole: () => get().role,

  isTokenValid: () => {
    const {
      access_token,
      clearAuth,
    } = get();

    const valid =
      access_token !== null &&
      !isTokenExpired(
        access_token
      );

    if (!valid) {
      clearAuth();
    }

    return valid;
  },
});

// ─────────────────────────────────────────────────────────────
// Store Export
// ─────────────────────────────────────────────────────────────

export const useAuthStore =
  create<AuthState>()(
    authStoreCreator
  );

// ─────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────

export const selectToken = (
  state: AuthState
) => state.access_token;

export const selectUser = (
  state: AuthState
) => state.user;

export const selectRole = (
  state: AuthState
) => state.role;

export const selectTenantId = (
  state: AuthState
) => state.tenantId;

export const selectHydrated = (
  state: AuthState
) => state.hydrated;

export const selectIsAuthenticated = (
  state: AuthState
) => state.isAuthenticated;

// ─────────────────────────────────────────────────────────────
// Non-reactive Helpers
// ─────────────────────────────────────────────────────────────

export const getAccessToken =
  (): string | null =>
    useAuthStore.getState()
      .access_token;

export const clearAuthState =
  (): void =>
    useAuthStore
      .getState()
      .clearAuth();
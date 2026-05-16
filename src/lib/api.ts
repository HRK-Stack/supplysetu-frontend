// `src/lib/api.ts`

/**
 * TASK-FE-001: Axios API Client — SupplySetu
 * TASK-FE-012: Silent Token Refresh (enhanced)
 *
 * Single Axios instance for all API communication.
 * - Auto-attaches Bearer token from authStore (memory only, never localStorage)
 * - Silent token refresh on 401 — queues failed requests, replays after rotation
 * - Reads csrf_token from document.cookie (non-HttpOnly) for /refresh and /logout
 * - 409 VERSION_CONFLICT: toast + no auto-retry (per §5.1.13 and §7.9 rules)
 * - Raw fetch() is PROHIBITED everywhere in the codebase — use this instance only
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: ApiError | null;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  error: ApiError | null;
}

// ─── Auth store interface (avoids circular import — store injects itself) ─────

interface AuthStoreRef {
  getToken: () => string | null;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

let _authStore: AuthStoreRef | null = null;

/**
 * Called once during app bootstrap (in authStore initialisation).
 * Injects the store reference so the interceptor can read/write tokens
 * without importing the store directly (which would be circular).
 */
export function injectAuthStore(store: AuthStoreRef): void {
  _authStore = store;
}


// ─── CSRF helper ─────────────────────────────────────────────────────────────

/**
 * Reads csrf_token from document.cookie.
 * The cookie is NOT HttpOnly — JS must read it for the double-submit pattern.
 * Returns empty string if not found (will cause 403 on protected endpoints).
 */
function getCsrfToken(): string {
  if (typeof document === "undefined") {
    return "";
  }
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

const refreshClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

refreshClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const csrf = getCsrfToken();

    if (!csrf) {
      throw new Error("Missing CSRF token");
    }

    config.headers = config.headers ?? {};
    config.headers["X-CSRF-Token"] = csrf;

    return config;
  }
);


// ─── Refresh state (TASK-FE-012) ──────────────────────────────────────────────
/**
 * Token refresh queue management.
 * When a 401 occurs and refresh is already in progress, subsequent 401s
 * are queued and retried after the token is refreshed.
 * This prevents N concurrent refresh calls — only one refresh per cycle.
 */

let _isRefreshing = false;

type RefreshSubscriber = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let _refreshSubscribers: RefreshSubscriber[] = [];

/**
 * Subscribe to the token refresh completion.
 * Called when a request arrives during refresh — queues the callback.
 */
function subscribeTokenRefresh(
  resolve: (token: string) => void,
  reject: (error: unknown) => void
): void {
  _refreshSubscribers.push({ resolve, reject });
}

/**
 * Notify all subscribers that refresh succeeded with a new token.
 * All queued requests can now proceed with the new Bearer token.
 */
function notifyRefreshSubscribers(token: string): void {
  _refreshSubscribers.forEach((sub) => sub.resolve(token));
  _refreshSubscribers = [];
}

/**
 * Notify all subscribers that refresh failed.
 * All queued requests will fail — caller redirects to login.
 */
function clearRefreshSubscribers(error?: unknown): void {
  _refreshSubscribers.forEach((sub) => sub.reject(error));
  _refreshSubscribers = [];
}

// ─── Axios instance ───────────────────────────────────────────────────────────
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}
const api: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 30000),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // required for HttpOnly refresh_token + csrf_token cookies
});

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Attach Bearer token from in-memory auth store
    const token = _authStore?.getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach CSRF header for refresh and logout endpoints
    // The csrf_token cookie is NOT HttpOnly — JS reads it via document.cookie
    const url = config.url ?? "";
    const needsCsrf = url.includes("/auth/refresh") || url.includes("/auth/logout");
    if (needsCsrf) {
      const csrf = getCsrfToken();
      if (!csrf) {
        throw new Error("Missing CSRF token");

      }
      config.headers = config.headers ?? {};
      config.headers["X-CSRF-Token"] = csrf;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
/**
 * TASK-FE-012: Silent Token Refresh Logic
 *
 * Handles 401 responses by attempting a silent token refresh:
 * 1. Read csrf_token from document.cookie (NOT HttpOnly)
 * 2. POST /api/v1/auth/refresh with X-CSRF-Token header
 * 3. Update access_token in authStore
 * 4. Replay queued requests with new token
 * 5. On failure (REFRESH_TOKEN_INVALID, REFRESH_TOKEN_REUSED): clear auth + redirect
 *
 * Queuing mechanism:
 * - First 401: trigger refresh, set isRefreshing = true
 * - Concurrent 401s: subscribe to queue, wait for refresh result
 * - Max 1 refresh per cycle (prevent infinite loops via _retry flag)
 */

api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError<ApiResponse<null>>) => {
    if (!error.config) {
      return Promise.reject(error);
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const data = error.response?.data as ApiResponse<null> | undefined;
    const errorCode = data?.error?.code;

    // ── 401: TASK-FE-012 Silent Token Refresh ─────────────────────────────────
    if (
      status === 401 &&
      !originalRequest._retry &&
      // Do not retry the refresh call itself to avoid infinite loops
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (_isRefreshing) {
        // Refresh already in progress — queue this request
        // It will be retried after refresh completes with the new token
        return new Promise<AxiosResponse>((resolve, reject) => {
          subscribeTokenRefresh(
            (newToken: string) => {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            reject
          );
        });
      }

      // Mark as retry to prevent infinite loops on this specific request
      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        // POST /auth/refresh with X-CSRF-Token header (added by request interceptor)
        // refresh_token cookie is sent automatically (withCredentials: true, HttpOnly)
        // On success: receive new access_token + updated csrf_token cookie
        const refreshResponse = await refreshClient.post<
          ApiResponse<{ access_token: string; expires_in: number }>
        >("/auth/refresh");

        const newToken = refreshResponse.data?.data?.access_token;
        if (!newToken) {
          throw new Error("Invalid refresh response: missing access_token");
        }
        // Update access token in Zustand store
        _authStore?.setToken(newToken);

        // Notify all queued requests — they can now proceed with new token
        notifyRefreshSubscribers(newToken);

        // Retry the original failed request with the new token
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {

        clearRefreshSubscribers(refreshError);
        // Refresh failed — terminal auth failure
        // Possible error codes: REFRESH_TOKEN_INVALID, REFRESH_TOKEN_REUSED, CSRF_VALIDATION_FAILED
        const refreshErrorData = (refreshError as AxiosError<ApiResponse<null>>)
          ?.response?.data?.error?.code;

        if (
          refreshErrorData === "REFRESH_TOKEN_INVALID" ||
          refreshErrorData === "REFRESH_TOKEN_REUSED" ||
          refreshErrorData === "CSRF_VALIDATION_FAILED"
        ) {
          // Clear all auth state and redirect to login
          
          _authStore?.clearAuth();

          if (typeof window !== "undefined") {
            window.location.replace("/login");
          }
        }

        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    // ── 403 CSRF_VALIDATION_FAILED: clear auth + redirect ─────────────────────
    if (status === 403 && errorCode === "CSRF_VALIDATION_FAILED") {
      _authStore?.clearAuth();
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
      return Promise.reject(error);
    }

    // ── 409 VERSION_CONFLICT: NEVER auto-retry — surface to caller ────────────
    // The caller is responsible for refetching and notifying the user.
    // Per §5.1.13 and §7.9: auto-retry on 409 is PROHIBITED.
    if (status === 409) {
      // Let the error propagate — UI layer handles toast + refetch
      return Promise.reject(error);
    }

    // ── 429 RATE_LIMITED ──────────────────────────────────────────────────────
    if (status === 429) {
      return Promise.reject(error);
    }

    // ── 500 INTERNAL_ERROR ────────────────────────────────────────────────────
    if (status === 500) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ─── Typed request helpers ────────────────────────────────────────────────────

/**
 * GET a single resource.
 * Usage: await apiGet<DealerRead>('/dealers/uuid')
 */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.get<ApiResponse<T>>(url, config);
  return response.data;
}

/**
 * GET a paginated list resource.
 * Usage: await apiList<DealerRead>('/dealers', { params: { page: 1, page_size: 20 } })
 */
export async function apiList<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<PaginatedResponse<T>> {
  const response = await api.get<PaginatedResponse<T>>(url, config);
  return response.data;
}

/**
 * POST to create a resource.
 * Usage: await apiPost<DealerRead>('/dealers', payload)
 */
export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.post<ApiResponse<T>>(url, data, config);
  return response.data;
}

/**
 * PATCH to update a resource.
 * ALWAYS include `version` in the payload for optimistic locking (§7.7.1).
 * Usage: await apiPatch<DealerRead>('/dealers/uuid', { version: 2, name: 'New Name' })
 */
export async function apiPatch<T>(
  url: string,
  data: { version: number } & Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.patch<ApiResponse<T>>(url, data, config);
  return response.data;
}

/**
 * DELETE a resource (soft delete on backend).
 * Usage: await apiDelete('/dealers/uuid/addresses/addr-uuid')
 */
export async function apiDelete<T = null>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.delete<ApiResponse<T>>(url, config);
  return response.data;
}

// ─── Error extraction helpers ─────────────────────────────────────────────────

/**
 * Extracts the structured ApiError from an AxiosError.
 * Returns a generic error if the response is not structured.
 */
export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<null> | undefined;
    if (data?.error) return data.error;
    return {
      code: "NETWORK_ERROR",
      message: error.message ?? "Network error",
      details: {},
    };
  }
  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
    details: {},
  };
}

/**
 * Returns true if the error is a VERSION_CONFLICT (409).
 * Use this in PATCH handlers to trigger refetch + user notification.
 */
export function isVersionConflict(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 409 &&
      error.response?.data?.error?.code === "VERSION_CONFLICT";
  }
  return false;
}

/**
 * Extracts current_version from a VERSION_CONFLICT error.
 * Returns undefined if not present.
 */
export function getConflictVersion(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.details?.current_version as
      | number
      | undefined;
  }
  return undefined;
}

/**
 * Returns true if the error is a QUOTE_EXPIRED (400).
 */
export function isQuoteExpired(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 400 &&
      error.response?.data?.error?.code === "QUOTE_EXPIRED";
  }
  return false;
}

/**
 * Returns true if the error is a CREDIT_LIMIT_EXCEEDED (400).
 */
export function isCreditLimitExceeded(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 400 &&
      error.response?.data?.error?.code === "CREDIT_LIMIT_EXCEEDED";
  }
  return false;
}

export default api;


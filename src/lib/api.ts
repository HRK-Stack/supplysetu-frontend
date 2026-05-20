// src/lib/api.ts

/**
 * TASK-FE-001: Axios API Client — SupplySetu
 * TASK-FE-012: Silent Token Refresh (enhanced)
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

// ─── Auth store interface ────────────────────────────────────────────────────

interface AuthStoreRef {
  getToken: () => string | null;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

let _authStore: AuthStoreRef | null = null;

export function injectAuthStore(store: AuthStoreRef): void {
  _authStore = store;
}

// ─── CSRF helper ─────────────────────────────────────────────────────────────

function getCsrfToken(): string {
  if (typeof document === "undefined") {
    return "";
  }
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

// ─── Refresh client ──────────────────────────────────────────────────────────
const refreshClient = axios.create({
  baseURL: "/api/v1",
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

// ─── Refresh state ───────────────────────────────────────────────────────────

let _isRefreshing = false;

type RefreshSubscriber = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let _refreshSubscribers: RefreshSubscriber[] = [];

function subscribeTokenRefresh(
  resolve: (token: string) => void,
  reject: (error: unknown) => void
): void {
  _refreshSubscribers.push({ resolve, reject });
}

function notifyRefreshSubscribers(token: string): void {
  _refreshSubscribers.forEach((sub) => sub.resolve(token));
  _refreshSubscribers = [];
}

function clearRefreshSubscribers(error?: unknown): void {
  _refreshSubscribers.forEach((sub) => sub.reject(error));
  _refreshSubscribers = [];
}

// ─── Main Axios instance ─────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: "/api/v1",
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 30000),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ─── Request interceptor ─────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = _authStore?.getToken();
    
    console.log("TOKEN:", token);
    console.log("URL:", config.url);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

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

    // ── 401: Silent Token Refresh ───────────────────────────────────────────
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (_isRefreshing) {
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

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const refreshResponse = await refreshClient.post<
          ApiResponse<{ access_token: string; expires_in: number }>
        >("/auth/refresh");

        const newToken = refreshResponse.data?.data?.access_token;
        if (!newToken) {
          throw new Error("Invalid refresh response: missing access_token");
        }

        _authStore?.setToken(newToken);
        notifyRefreshSubscribers(newToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearRefreshSubscribers(refreshError);

        const refreshErrorData = (refreshError as AxiosError<ApiResponse<null>>)
          ?.response?.data?.error?.code;

        if (
          refreshErrorData === "REFRESH_TOKEN_INVALID" ||
          refreshErrorData === "REFRESH_TOKEN_REUSED" ||
          refreshErrorData === "CSRF_VALIDATION_FAILED"
        ) {
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

    // ── 403 CSRF_VALIDATION_FAILED ──────────────────────────────────────────
    if (status === 403 && errorCode === "CSRF_VALIDATION_FAILED") {
      _authStore?.clearAuth();
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
      return Promise.reject(error);
    }

    // ── 409 / 429 / 500 ───────────────────────────────────────────────────
    if (status === 409 || status === 429 || status === 500) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ─── Typed request helpers ────────────────────────────────────────────────────

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.get<ApiResponse<T>>(url, config);
  return response.data;
}

export async function apiList<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<PaginatedResponse<T>> {
  const response = await api.get<PaginatedResponse<T>>(url, config);
  return response.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.post<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function apiPatch<T>(
  url: string,
  data: { version: number } & Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.patch<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function apiDelete<T = null>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.delete<ApiResponse<T>>(url, config);
  return response.data;
}

// ─── Error extraction helpers ─────────────────────────────────────────────────

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

export function isVersionConflict(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 409 &&
      error.response?.data?.error?.code === "VERSION_CONFLICT";
  }
  return false;
}

export function getConflictVersion(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.details?.current_version as
      | number
      | undefined;
  }
  return undefined;
}

export function isQuoteExpired(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 400 &&
      error.response?.data?.error?.code === "QUOTE_EXPIRED";
  }
  return false;
}

export function isCreditLimitExceeded(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 400 &&
      error.response?.data?.error?.code === "CREDIT_LIMIT_EXCEEDED";
  }
  return false;
}

export default api;
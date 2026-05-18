// src/app/(auth)/login/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { z } from "zod";

import api from "@/lib/api";

import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters"
    ),
});

interface LoginError {
  code: string;
  message: string;
  retryAfterSeconds?: number;
}

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      router.replace("/");
    }
  }, [router]);

  const { setToken, setUser } =
    useAuthStore();

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<LoginError | null>(null);

  const [retryCountdown, setRetryCountdown] =
    useState(0);

  const intervalRef =
    useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCountdown = (seconds: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setRetryCountdown(seconds);

    intervalRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError(null);

    try {
      loginSchema.parse({
        email,
        password,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.issues[0];

        setError({
          code: "VALIDATION_ERROR",
          message: fieldError.message,
        });
      }

      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        {
          email: email
            .trim()
            .toLowerCase(),

          password,
        }
      );

      const {
        access_token,
        user,
      } = response.data.data;

      setToken(access_token);

      setUser(user);

      router.replace("/");
    } catch (err: unknown) {
      const error =
        err as {
          response?: {
            status?: number;
            data?: {
              error?: {
                message?: string;
                details?: {
                  retry_after_seconds?: number;
                };
              };
            };
          };
        };

      const status =
        error.response?.status;

      const errorData =
        error.response?.data?.error;

      if (status === 401) {
        setError({
          code: "INVALID_CREDENTIALS",

          message:
            "Invalid email or password. Please try again.",
        });
      } else if (status === 429) {
        const retryAfter =
          errorData?.details
            ?.retry_after_seconds ?? 60;

        setError({
          code: "RATE_LIMITED",

          message: `Too many login attempts. Try again in ${retryAfter} seconds.`,

          retryAfterSeconds:
            retryAfter,
        });

        startCountdown(retryAfter);
      } else {
        setError({
          code: "UNKNOWN_ERROR",

          message:
            errorData?.message ??
            "An error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        relative flex min-h-screen
        items-center justify-center
        overflow-hidden

        bg-linear-to-br
        from-[#0F1F3D]
        via-[#1A3260]
        to-[#0F1F3D]
      "
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 overflow-hidden
        "
      >
        <div
          className="
            absolute -right-40 -top-40
            h-80 w-80 rounded-full
            bg-[#D97706]
            opacity-5 blur-3xl
          "
        />

        <div
          className="
            absolute -bottom-32 -left-32
            h-96 w-96 rounded-full
            bg-[#D97706]
            opacity-5 blur-3xl
          "
        />

        <div
          className="
            absolute left-1/2 top-1/2
            h-96 w-96
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[#E8EDF5]
            opacity-[0.03]
            blur-3xl
          "
        />
      </div>

      {/* Container */}
      <div
        className="
          relative z-10 w-full
          max-w-md px-6
          sm:px-8
        "
      >
        {/* Branding */}
        <div className="mb-12 text-center">
          <div
            className="
              mb-4 inline-flex
              items-center gap-2
            "
          >
            <div
              className="
                h-2.5 w-2.5
                rotate-45 rounded-sm
                bg-[#D97706]
              "
            />

            <span
              className="
                font-['Syne']
                text-2xl font-bold
                tracking-tight text-white
              "
            >
              SupplySetu
            </span>
          </div>

          <p
            className="
              text-sm font-normal
              tracking-wide
              text-[#E8EDF5]
            "
          >
            B2B Hardware Distribution
          </p>
        </div>

        {/* Card */}
        <div
          className="
            overflow-hidden rounded-2xl
            bg-white shadow-2xl
            backdrop-blur-xl
          "
        >
          {/* Header */}
          <div
            className="
              bg-linear-to-r
              from-[#0F1F3D]
              to-[#1A3260]
              px-8 py-8
            "
          >
            <h1
              className="
                mb-2 font-['Syne']
                text-2xl font-bold
                text-white
              "
            >
              Welcome Back
            </h1>

            <p
              className="
                text-sm text-[#E8EDF5]
              "
            >
              Sign in to your account to
              continue
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="
              space-y-6 px-8 py-8
            "
          >
            {/* Error */}
            {error && (
              <div
                className="
                  rounded-lg border-l-4
                  border-[#B91C1C]
                  bg-[#FEE2E2]
                  p-4
                "
              >
                <p
                  className="
                    text-sm font-medium
                    text-[#B91C1C]
                  "
                >
                  {error.message}
                </p>

                {error.code ===
                  "RATE_LIMITED" &&
                  retryCountdown > 0 && (
                    <p
                      className="
                        mt-1.5 text-xs
                        text-[#7F1D1D]
                      "
                    >
                      Retry available in{" "}
                      {retryCountdown}s
                    </p>
                  )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="
                  block text-sm
                  font-medium
                  text-[#0F1F3D]
                "
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                placeholder="your@company.com"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                disabled={
                  isLoading ||
                  retryCountdown > 0
                }
                aria-invalid={
                  !!error &&
                  error.code ===
                    "VALIDATION_ERROR"
                }
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  w-full rounded-lg
                  border border-[#CBD5E1]
                  px-4 py-3

                  text-[#0F1F3D]
                  placeholder-[#94A3B8]

                  transition-all duration-200

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#D97706]
                  focus-visible:border-transparent

                  disabled:cursor-not-allowed
                  disabled:bg-[#F1F5F9]
                  disabled:text-[#94A3B8]
                "
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="
                  block text-sm
                  font-medium
                  text-[#0F1F3D]
                "
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={
                  isLoading ||
                  retryCountdown > 0
                }
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="
                  w-full rounded-lg
                  border border-[#CBD5E1]
                  px-4 py-3

                  text-[#0F1F3D]
                  placeholder-[#94A3B8]

                  transition-all duration-200

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#D97706]
                  focus-visible:border-transparent

                  disabled:cursor-not-allowed
                  disabled:bg-[#F1F5F9]
                  disabled:text-[#94A3B8]
                "
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isLoading ||
                retryCountdown > 0
              }
              className="
                relative flex w-full
                items-center justify-center
                gap-2 overflow-hidden
                rounded-lg py-3

                bg-linear-to-r
                from-[#0F1F3D]
                to-[#1A3260]

                font-semibold text-white

                transition-all duration-200

                hover:from-[#1A3260]
                hover:to-[#2E4A7A]

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#D97706]

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isLoading && (
                <svg
                  className="
                    h-5 w-5 animate-spin
                  "
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />

                  <path
                    fill="currentColor"
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 
                    0 0 5.373 0 12h4zm2 
                    5.291A7.962 7.962 0 
                    014 12H0c0 3.042 
                    1.135 5.824 3 
                    7.938l3-2.647z"
                  />
                </svg>
              )}

              <span>
                {isLoading
                  ? "Signing in..."
                  : retryCountdown > 0
                    ? `Try again in ${retryCountdown}s`
                    : "Sign In"}
              </span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div
                className="
                  absolute inset-0
                  flex items-center
                "
              >
                <div
                  className="
                    w-full border-t
                    border-[#E2E8F0]
                  "
                />
              </div>

              <div
                className="
                  relative flex
                  justify-center text-sm
                "
              >
                <span
                  className="
                    bg-white px-2
                    text-[#94A3B8]
                  "
                >
                  Demo
                </span>
              </div>
            </div>

            {/* Demo */}
            <div
              className="
                space-y-2 rounded-lg
                border border-[#BFDBFE]
                bg-[#EFF6FF] p-4
                text-sm
              "
            >
              <p
                className="
                  font-medium
                  text-[#1D4ED8]
                "
              >
                Demo Admin Account:
              </p>

              <div
                className="
                  space-y-1.5
                  font-mono text-[#1E3A8A]
                "
              >
                <div>
                  <span
                    className="
                      text-[#94A3B8]
                    "
                  >
                    Email:
                  </span>{" "}
                  admin@demo.com
                </div>

                <div>
                  <span
                    className="
                      text-[#94A3B8]
                    "
                  >
                    Password:
                  </span>{" "}
                  Demo@12345
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div
            className="
              border-t border-[#E2E8F0]
              bg-[#F8FAFC]
              px-8 py-4 text-center
              text-xs text-[#94A3B8]
            "
          >
            Secure. Enterprise-grade.
            ISO 27001 ready.
          </div>
        </div>

        {/* Version */}
        <div
          className="
            mt-8 text-center
            text-xs text-[#CBD5E1]
          "
        >
          SupplySetu v1.0.0
        </div>
      </div>
    </div>
  );
}

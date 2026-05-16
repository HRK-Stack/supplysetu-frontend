// // src/hooks/useAuth.ts

// "use client";

// import { useAuthStore } from "@/store/authStore";
// import { isTokenExpired } from "@/lib/auth";

// export function useAuth() {
//   const user = useAuthStore((s) => s.user);
//   const role = useAuthStore((s) => s.role);
//   const token = useAuthStore((s) => s.access_token);
//   const isAuthLoading = useAuthStore((s) => s.hydrated); // ✅ required

//   const isAuthenticated = !!token && !isTokenExpired(token);
//   return {
//     user,
//     role,
//     isAuthenticated,
//     isLoading: isAuthLoading,
//   };
// }
"use client";

import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const {
    isAuthenticated,
    role,
  } = useAuthStore();

  return {
    isAuthenticated,
    role,
    isLoading: false,
  };
}
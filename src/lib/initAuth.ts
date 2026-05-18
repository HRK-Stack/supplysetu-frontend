// src/lib/initAuth.ts
import { injectAuthStore } from "./api";
import { useAuthStore } from "@/store/authStore";

// Lazy resolution avoids circular dependency:
// api.ts does NOT import authStore.ts at module level.
// authStore.ts does NOT import api.ts at module level.
// This file is the bridge, imported once in layout.tsx.
injectAuthStore({
  getToken: () => useAuthStore.getState().access_token,
  setToken: (token) => useAuthStore.getState().setToken(token),
  clearAuth: () => useAuthStore.getState().clearAuth(),
});
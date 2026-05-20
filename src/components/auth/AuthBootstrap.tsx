"use client";

import { useEffect } from "react";

import api from "@/lib/api";

import {
  useAuthStore,
} from "@/store/authStore";

export default function AuthBootstrap() {

  const {
    access_token,
    user,
    setUser,
    clearAuth,
  } = useAuthStore();

  useEffect(() => {

    /*
      No token
    */
    if (!access_token) {
      return;
    }

    /*
      Already restored
    */
    if (user) {
      return;
    }

    /*
      Fetch current user
    */
    const bootstrap =
      async () => {
        try {

          const response =
            await api.get(
              "/auth/me",
            );

          setUser(
            response.data.data,
          );

        } catch {

          clearAuth();
        }
      };

    void bootstrap();

  }, [
    access_token,
    user,
    setUser,
    clearAuth,
  ]);

  return null;
}
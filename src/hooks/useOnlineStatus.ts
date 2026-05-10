// src/hooks/useOnlineStatus.ts
// SupplySetu — useOnlineStatus hook
//
// Tracks browser online/offline state and automatically triggers
// processQueue() when the connection is restored after an offline period.
//
// Usage:
//   const { isOnline, wasOffline } = useOnlineStatus();
//
//   isOnline  — true when navigator.onLine is true
//   wasOffline — true if the browser went offline at least once this session
//               (used to show a "back online" toast / banner)

"use client";

import { useEffect, useRef, useState } from "react";
import { processQueue } from "@/lib/idb";

export interface OnlineStatus {
  /**
   * Current network connectivity state.
   * Mirrors navigator.onLine and updates reactively on online/offline events.
   */
  isOnline: boolean;

  /**
   * True if the browser went offline at least once during this page session.
   * Used by components to show a "Connection restored" banner after sync.
   *
   * Resets to false if the page is reloaded (intentional — fresh session).
   */
  wasOffline: boolean;
}

/**
 * Returns the current online status and whether the user was previously offline.
 *
 * On reconnect (offline → online transition):
 *   1. Sets isOnline = true
 *   2. Sets wasOffline = true
 *   3. Calls processQueue() to replay any mutations queued while offline
 *
 * On disconnect (online → offline transition):
 *   1. Sets isOnline = false
 *
 * SSR-safe: during server rendering (typeof window === "undefined"),
 * isOnline defaults to true and wasOffline to false — the assumption is
 * that the server environment is always "online".
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return true;
    return true;
  });

  const [wasOffline, setWasOffline] = useState(false);

  // Track whether we've gone offline in this session without triggering
  // an extra re-render — we only set wasOffline on the reconnect event.
  const wentOfflineRef = useRef(false);

  // Track in-flight processQueue call to prevent concurrent replays
  const processingRef = useRef(false);

  useEffect(() => {
    async function handleOnline() {
      setIsOnline(true);

      if (wentOfflineRef.current) {
        setWasOffline(true);
        wentOfflineRef.current = false;
      }

      if (!processingRef.current) {
        processingRef.current = true;
        try {
          await processQueue();
        } finally {
          processingRef.current = false;
        }
      }
    }

    function handleOffline() {
      setIsOnline(false);
      wentOfflineRef.current = true;
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

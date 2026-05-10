// src/lib/idb.ts
// SupplySetu — IndexedDB sync queue, conflict store, and response cache
//
// Database: "supplysetu_sync"  (version 1)
// Object stores:
//   sync_queue    — pending offline mutations waiting to be replayed
//   sync_conflicts — mutations that failed with HTTP 409 (never auto-retried)
//   cache         — API response snapshots for offline reads
//
// Design rules:
//   - NEVER block UI on offline state — all writes to sync_queue are fire-and-forget
//   - 409 conflicts move to sync_conflicts and are NEVER re-queued
//   - processQueue() is called automatically by useOnlineStatus on reconnect
//   - All IDB operations wrapped in try/catch — failures are logged, not thrown
//     (a broken IDB store should not crash the app)


import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** A mutation queued while the app was offline. */
export interface SyncMutation {
  /** Unique client-generated ID (crypto.randomUUID or Date.now fallback). */
  id: string;
  /** HTTP method of the original request. */
  method: HttpMethod;
  /** Full API path, e.g. "/api/v1/quotes/uuid/status". */
  url: string;
  /** Request body serialised to a plain object (JSON-serialisable). */
  payload: Record<string, unknown> | null;
  /** ISO timestamp when the mutation was enqueued. */
  timestamp: string;
  /** How many replay attempts have been made (incremented on each processQueue pass). */
  retry_count: number;
}

/** A mutation that failed with HTTP 409 during sync replay. */
export interface SyncConflict {
  /** Same ID as the original SyncMutation. */
  id: string;
  /** The original mutation that caused the conflict. */
  mutation: SyncMutation;
  /** ISO timestamp when the conflict was detected. */
  conflict_at: string;
  /**
   * The server's current version from the 409 response body
   * ("details.current_version"). Null if not present in the error payload.
   */
  server_version: number | null;
}

/** An API response snapshot for offline reads. */
export interface CacheEntry {
  /** Cache key — typically the request URL + serialised query params. */
  key: string;
  /** The parsed JSON response body. */
  data: unknown;
  /** ISO timestamp when this entry was written. */
  timestamp: string;
}

// ─── DB constants ─────────────────────────────────────────────────────────────

const DB_NAME = "supplysetu_sync";
const DB_VERSION = 1;

const STORE_QUEUE = "sync_queue" as const;
const STORE_CONFLICTS = "sync_conflicts" as const;
const STORE_CACHE = "cache" as const;

// ─── DB initialisation ────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null;

/**
 * Opens (and if needed upgrades) the IndexedDB database.
 * Idempotent — subsequent calls return the cached connection.
 *
 * Returns null if IndexedDB is unavailable (SSR, private browsing with
 * storage blocked, etc.) so callers can degrade gracefully.
 */
async function openDb(): Promise<IDBDatabase | null> {
  if (_db) return _db;

  // Guard: IndexedDB is unavailable during SSR
  if (typeof indexedDB === "undefined") return null;

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // sync_queue — keyed by mutation id
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const qStore = db.createObjectStore(STORE_QUEUE, { keyPath: "id" });
        qStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      // sync_conflicts — keyed by conflict id
      if (!db.objectStoreNames.contains(STORE_CONFLICTS)) {
        const cStore = db.createObjectStore(STORE_CONFLICTS, { keyPath: "id" });
        cStore.createIndex("conflict_at", "conflict_at", { unique: false });
      }

      // cache — keyed by cache key string
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        const caStore = db.createObjectStore(STORE_CACHE, { keyPath: "key" });
        caStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      _db = (event.target as IDBOpenDBRequest).result;

      // Re-open on version change (e.g. another tab upgrades the DB)
      _db.onversionchange = () => {
        _db?.close();
        _db = null;
      };

      resolve(_db);
    };

    request.onerror = () => {
      console.error("[idb] Failed to open IndexedDB:", request.error);
      resolve(null);
    };
  });
}

// ─── Generic IDB helpers ──────────────────────────────────────────────────────

function idbPut<T>(
  db: IDBDatabase,
  storeName: string,
  value: T,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

function idbGet<T>(
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

// ─── ID generation ────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────

/**
 * Adds a mutation to the sync_queue store.
 *
 * Called when a write request is made while the app is offline.
 * Never throws — failures are silently logged so the UI is not disrupted.
 *
 * @param mutation  Partial mutation — id and timestamp are auto-generated if omitted
 */
export async function enqueueMutation(
  mutation: Omit<SyncMutation, "id" | "timestamp" | "retry_count"> & {
    id?: string;
    timestamp?: string;
    retry_count?: number;
  },
): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;

    const full: SyncMutation = {
      id: mutation.id ?? generateId(),
      method: mutation.method,
      url: mutation.url,
      payload: mutation.payload,
      timestamp: mutation.timestamp ?? new Date().toISOString(),
      retry_count: mutation.retry_count ?? 0,
    };

    await idbPut(db, STORE_QUEUE, full);
  } catch (err) {
    console.error("[idb] enqueueMutation failed:", err);
  }
}

/**
 * Returns all pending mutations from the sync_queue, sorted oldest-first.
 */
export async function getQueuedMutations(): Promise<SyncMutation[]> {
  try {
    const db = await openDb();
    if (!db) return [];
    const all = await idbGetAll<SyncMutation>(db, STORE_QUEUE);
    return all.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  } catch (err) {
    console.error("[idb] getQueuedMutations failed:", err);
    return [];
  }
}

/**
 * Removes a mutation from the sync_queue by id.
 * Called after a successful replay.
 */
export async function dequeueMutation(id: string): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;
    await idbDelete(db, STORE_QUEUE, id);
  } catch (err) {
    console.error("[idb] dequeueMutation failed:", err);
  }
}

/**
 * Replays all queued mutations against the API in chronological order.
 *
 * For each mutation:
 *   - On success (2xx)  → remove from sync_queue
 *   - On 409            → move to sync_conflicts (NEVER re-queue)
 *   - On other error    → increment retry_count, leave in queue for next pass
 *
 * Dispatches a CustomEvent "supplysetu:sync-conflict" for each 409 so the
 * Toast system (or any listener) can notify the user without idb.ts depending
 * on a specific toast library.
 *
 * Never throws — all errors are caught internally.
 */
export async function processQueue(): Promise<void> {
  const mutations = await getQueuedMutations();
  if (mutations.length === 0) return;

  
  for (const mutation of mutations) {
    try {
      await api.request({
        url: mutation.url,
        method: mutation.method,
        data: mutation.payload ?? undefined,
      });

      await dequeueMutation(mutation.id);
      continue;

    } catch (error: any) {
      if (error?.response?.status === 409) {
        const serverVersion =
          error.response?.data?.error?.details?.current_version ?? null;

        await moveToConflicts(mutation, serverVersion);
        dispatchSyncConflictEvent(mutation);
        continue;
      }

      // 🔁 RETRY LOGIC (MISSING IN YOUR CODE)
      if (mutation.retry_count >= 5) {
        await dequeueMutation(mutation.id);
        continue;
      }

      const db = await openDb();
      if (!db) continue;

      mutation.retry_count += 1;
      await idbPut(db, STORE_QUEUE, mutation);

      continue;
    }
  }

  dispatchSyncCompleteEvent();
}
// ─── Conflict Store ───────────────────────────────────────────────────────────

/**
 * Moves a mutation from sync_queue to sync_conflicts.
 * Internal helper called by processQueue on HTTP 409.
 */
async function moveToConflicts(
  mutation: SyncMutation,
  serverVersion: number | null,
): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;

    const conflict: SyncConflict = {
      id: mutation.id,
      mutation,
      conflict_at: new Date().toISOString(),
      server_version: serverVersion,
    };

    await idbPut(db, STORE_CONFLICTS, conflict);
    await idbDelete(db, STORE_QUEUE, mutation.id);
  } catch (err) {
    console.error("[idb] moveToConflicts failed:", err);
  }
}

/**
 * Returns all sync conflict records, sorted most-recent-first.
 */
export async function getConflicts(): Promise<SyncConflict[]> {
  try {
    const db = await openDb();
    if (!db) return [];
    const all = await idbGetAll<SyncConflict>(db, STORE_CONFLICTS);
    return all.sort((a, b) => {
      const ta = new Date(a.conflict_at).getTime();
      const tb = new Date(b.conflict_at).getTime();
      return tb - ta; // most recent first (your comment says this)
    });
  } catch (err) {
    console.error("[idb] getConflicts failed:", err);
    return [];
  }
}

/**
 * Removes a resolved conflict from sync_conflicts by id.
 * Called after the user has acknowledged and resolved a conflict.
 */
export async function clearConflict(id: string): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;
    await idbDelete(db, STORE_CONFLICTS, id);
  } catch (err) {
    console.error("[idb] clearConflict failed:", err);
  }
}

/**
 * Returns the number of unresolved conflicts.
 * Useful for displaying a badge count in the UI.
 */
export async function getConflictCount(): Promise<number> {
  const conflicts = await getConflicts();
  return conflicts.length;
}

// ─── Response Cache ───────────────────────────────────────────────────────────

/**
 * Writes an API response to the offline read cache.
 *
 * @param key   Cache key — typically the request URL
 * @param data  Parsed JSON response body
 */
export async function setCacheEntry(key: string, data: unknown): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;

    const entry: CacheEntry = {
      key,
      data,
      timestamp: new Date().toISOString(),
    };

    await idbPut(db, STORE_CACHE, entry);
  } catch (err) {
    console.error("[idb] setCacheEntry failed:", err);
  }
}

/**
 * Reads a cached API response.
 *
 * @param key          Cache key
 * @param maxAgeMs     Maximum age in milliseconds. Entries older than this are
 *                     treated as stale and return undefined. Default: 5 minutes.
 *
 * @returns The cached data, or undefined if missing / stale.
 */
export async function getCacheEntry(
  key: string,
  maxAgeMs = 5 * 60 * 1000,
): Promise<unknown | undefined> {
  try {
    const db = await openDb();
    if (!db) return undefined;

    const entry = await idbGet<CacheEntry>(db, STORE_CACHE, key);
    if (!entry) return undefined;

    const ageMs = Date.now() - new Date(entry.timestamp).getTime();
    if (ageMs > maxAgeMs) return undefined; // stale

    return entry.data;
  } catch (err) {
    console.error("[idb] getCacheEntry failed:", err);
    return undefined;
  }
}

/**
 * Removes a specific cache entry by key.
 */
export async function invalidateCacheEntry(key: string): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;
    await idbDelete(db, STORE_CACHE, key);
  } catch (err) {
    console.error("[idb] invalidateCacheEntry failed:", err);
  }
}

// ─── Database maintenance ─────────────────────────────────────────────────────

/**
 * Clears all data from all stores.
 * Intended for use in tests and the "Clear offline data" settings action.
 */
export async function clearAllStores(): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;

    for (const storeName of [STORE_QUEUE, STORE_CONFLICTS, STORE_CACHE]) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  } catch (err) {
    console.error("[idb] clearAllStores failed:", err);
  }
}

// ─── DOM event bridge ─────────────────────────────────────────────────────────

/**
 * Dispatches a "supplysetu:sync-conflict" CustomEvent on window.
 *
 * The Toast system (or any UI layer) listens for this event without
 * idb.ts needing to import any specific toast library — keeping this
 * module free of UI dependencies.
 *
 * Event detail: { mutation: SyncMutation }
 */
function dispatchSyncConflictEvent(mutation: SyncMutation): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("supplysetu:sync-conflict", { detail: { mutation } }),
  );
}

/**
 * Dispatches a "supplysetu:sync-complete" CustomEvent on window.
 * Fired by processQueue when the queue has been fully drained.
 */
export function dispatchSyncCompleteEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("supplysetu:sync-complete"));
}

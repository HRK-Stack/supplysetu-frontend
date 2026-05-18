// src/types/dealer.ts
// SupplySetu — Dealer and DealerAddress domain types

import type { UUID, ISODateString } from "./common";
import type { UserStatus } from "./user";

// ─── Dealer ────────────────────────────────────────────────────────────────

export interface Dealer {
  id: UUID;
  tenant_id: UUID;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  address: string | null;
  territory_id: UUID | null;
  territory?: {
    id: UUID;
    name: string;
  } | null;
  discount_pct: number; // basis points; 500 = 5.00%
  credit_limit: number; // paise; 0 = cash-only (no credit check)
  outstanding_balance: number; // paise; read-only — synced from Tally
  status: UserStatus;
  version: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  created_by: UUID | null;
  updated_by: UUID | null;
}

export interface DealerCreate {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  territory_id?: UUID;
  discount_pct: number;  // basis points
  credit_limit: number;  // paise; 0 = cash-only
  // outstanding_balance is NOT accepted — system-managed
}

export interface DealerUpdate {
  version: number; // mandatory for optimistic locking
  name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  territory_id?: UUID;
  discount_pct?: number;
  credit_limit?: number;
  status?: UserStatus;
  // outstanding_balance is NOT included — only writable via /sync-balance
}

export interface DealerSyncBalance {
  outstanding_balance: number; // paise; ADMIN only via dedicated endpoint
}

export interface DealerListQueryParams {
  page?: number;
  page_size?: number;
  status?: UserStatus;
  territory_id?: UUID;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// ─── DealerAddress ─────────────────────────────────────────────────────────

export interface DealerAddress {
  id: UUID;
  tenant_id: UUID;
  dealer_id: UUID;
  label: string;           // e.g. "Main Warehouse"
  contact_name: string | null;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;         // exactly 6 digits
  is_default: boolean;
  version: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID;
  updated_by: UUID | null;
}

export interface DealerAddressCreate {
  label: string;
  contact_name?: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string; // exactly 6 digits — validated against ^[0-9]{6}$
  is_default: boolean;
}

export interface DealerAddressUpdate {
  version: number; // mandatory for optimistic locking
  label?: string;
  contact_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_default?: boolean;
}

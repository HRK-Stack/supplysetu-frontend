// src/types/scheme.ts
// SupplySetu — Promotional scheme domain types

import type { UUID, ISODateString } from "./common";

export interface SchemeAppliesTo {
  product_ids: UUID[];    // empty = applies to all products
  territory_ids: UUID[];  // empty = applies to all territories
  dealer_ids: UUID[];     // empty = applies to all dealers
}

export interface Scheme {
  id: UUID;
  tenant_id: UUID;
  name: string;
  discount_pct: number;   // basis points; e.g. 300 = 3.00%
  start_date: string;     // ISO date string "YYYY-MM-DD"
  end_date: string;       // ISO date string "YYYY-MM-DD"
  applies_to: SchemeAppliesTo;
  is_active: boolean;
  version: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID | null;
  updated_by: UUID | null;
}

export interface SchemeCreate {
  name: string;
  discount_pct: number; // basis points
  start_date: string;   // "YYYY-MM-DD"
  end_date: string;     // "YYYY-MM-DD"
  applies_to: SchemeAppliesTo;
}

export interface SchemeUpdate {
  version: number; // mandatory for optimistic locking
  name?: string;
  discount_pct?: number;
  start_date?: string;
  end_date?: string;
  applies_to?: SchemeAppliesTo;
  is_active?: boolean;
}

export interface SchemeListQueryParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

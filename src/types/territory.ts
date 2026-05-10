// src/types/territory.ts
// SupplySetu — Territory domain types

import type { UUID, ISODateString } from "./common";

export interface Territory {
  id: UUID;
  tenant_id: UUID;
  name: string;
  adjustment_pct: number; // basis points; signed (negative = price reduction)
  version: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID | null;
  updated_by: UUID | null;
}

export interface TerritoryCreate {
  name: string;
  adjustment_pct: number; // basis points
}

export interface TerritoryUpdate {
  version: number; // mandatory for optimistic locking
  name?: string;
  adjustment_pct?: number;
}

export interface TerritoryListQueryParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

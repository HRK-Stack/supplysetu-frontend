// src/types/product.ts
// SupplySetu — Product domain types

import type { UUID, ISODateString } from "./common";
import type { UserStatus } from "./user";

export type GstRate = 0 | 5 | 12 | 18 | 28;

export interface Product {
  id: UUID;
  tenant_id: UUID;
  sku: string;
  name: string;
  description: string | null;
  base_price: number;  // paise
  gst_rate: GstRate;   // integer percentage
  hsn_code: string;    // 4, 6, or 8 digit HSN/SAC code
  unit: string;        // e.g. "PCS"
  status: UserStatus;
  version: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID | null;
  updated_by: UUID | null;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  base_price: number; // paise; >= 0
  gst_rate: GstRate;
  hsn_code: string;   // required; 4, 6, or 8 digits
  unit?: string;      // default: "PCS"
}

export interface ProductUpdate {
  version: number; // mandatory for optimistic locking
  sku?: string;
  name?: string;
  description?: string;
  base_price?: number;
  gst_rate?: GstRate;
  hsn_code?: string;
  unit?: string;
  status?: UserStatus;
}

export interface ProductListQueryParams {
  page?: number;
  page_size?: number;
  status?: UserStatus;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

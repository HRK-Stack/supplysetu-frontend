// src/types/order.ts
// SupplySetu — Order and OrderItem domain types

import type { UUID, ISODateString } from "./common";
import type { PricingSnapshot } from "./pricing";

export type OrderStatus = "CONFIRMED" | "CANCELLED";

export type ExportStatus = "PENDING" | "EXPORTED" | "FAILED";

// ─── Order Item ────────────────────────────────────────────────────────────

export interface OrderItem {
  id: UUID;
  tenant_id: UUID;
  order_id: UUID;
  product_id: UUID;
  quantity: number;          // positive integer
  pricing_snapshot: PricingSnapshot; // copied verbatim from QuoteItem — never repriced
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID;
  updated_by: UUID | null;
  
}

// ─── Order ─────────────────────────────────────────────────────────────────

export interface Order {
  id: UUID;
  tenant_id: UUID;
  quote_id: UUID;
  quote_revision_id: UUID;
  dealer_id: UUID;
  sales_rep_id: UUID;
  ship_to_address_id: UUID | null;
  status: OrderStatus;
  export_status: ExportStatus;
  export_reference: string | null; // Tally confirmation code or "ERR:<reason>"
  exported_at: ISODateString | null;
  version: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID;
  updated_by: UUID | null;
  items?: OrderItem[];       // populated on detail endpoint
  
}

// ─── Request schemas ───────────────────────────────────────────────────────

/**
 * POST /api/v1/orders — Convert ACCEPTED quote to order.
 * HTTP 201 for new order, HTTP 200 for idempotent duplicate.
 */
export interface OrderCreate {
  quote_id: UUID;
  quote_version: number; // optimistic lock on the Quote
}

export interface OrderStatusUpdate {
  status: "CANCELLED";
  version: number; // mandatory for optimistic locking
}

export interface OrderExportUpdate {
  export_status: ExportStatus;
  export_reference?: string;
  version: number; // mandatory for optimistic locking
}

// ─── List query params ─────────────────────────────────────────────────────

export interface OrderListQueryParams {
  page?: number;
  page_size?: number;
  status?: OrderStatus;
  export_status?: ExportStatus;
  dealer_id?: UUID;
  created_at_from?: ISODateString;
  created_at_to?: ISODateString;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// ─── Credit check (display only) ──────────────────────────────────────────

export interface CreditLimitExceededDetails {
  credit_limit: number;       // paise
  outstanding_balance: number; // paise
  available_credit: number;   // paise
  order_total: number;        // paise
}

// ─── Tally export trigger ─────────────────────────────────────────────────

export interface ExportTriggerResponseData {
  export_status: ExportStatus;
  message: string;
}

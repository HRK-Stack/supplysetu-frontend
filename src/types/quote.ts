// src/types/quote.ts
// SupplySetu — Quote, QuoteRevision, and QuoteItem domain types

import type { UUID, ISODateString } from "./common";
import type { PricingSnapshot } from "./pricing";

export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "NEGOTIATION"
  | "ACCEPTED"
  | "REJECTED"
  | "CONVERTED_TO_ORDER";

// ─── Quote Item ────────────────────────────────────────────────────────────

export interface QuoteItem {
  id: UUID;
  tenant_id: UUID;
  quote_revision_id: UUID;
  product_id: UUID;
  quantity: number;         // positive integer
  pricing_snapshot: PricingSnapshot; // all 12 keys always present
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID;
  updated_by: UUID | null;
  
}

export interface QuoteItemCreate {
  product_id: UUID;
  quantity: number;          // positive integer
  override_price?: number | null; // paise; MANAGER/ADMIN only
}

// ─── Quote Revision ────────────────────────────────────────────────────────

export interface QuoteRevision {
  id: UUID;
  tenant_id: UUID;
  quote_id: UUID;
  revision_number: number;
  notes: string | null;
  valid_until: ISODateString; // UTC timestamp; hard block on acceptance/conversion
  ship_to_address_id: UUID | null;
  version: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID;
  updated_by: UUID | null;
  items?: QuoteItem[];        // populated on detail endpoints
}

// ─── Quote ────────────────────────────────────────────────────────────────

export interface Quote {
  id: UUID;
  tenant_id: UUID;
  dealer_id: UUID;
  sales_rep_id: UUID;
  quote_id?: string;
  dealer_name?: string;
  sales_rep_name?: string;
  dealer_credit_limit?: number;
  dealer_outstanding_balance?: number;
  current_revision_id:
    UUID | null;
  status: QuoteStatus;
  version: number;
  created_at:
    ISODateString;
  updated_at:
    ISODateString;
  deleted_at:
    ISODateString | null;
  created_by: UUID;
  updated_by:
    UUID | null;
  current_revision?:
    QuoteRevision;
}

// ─── Request schemas ───────────────────────────────────────────────────────

export interface QuoteCreate {
  dealer_id: UUID;
  notes?: string;
  ship_to_address_id?: UUID | null;
  valid_days?: number;        // 1–365; default 30
  items: QuoteItemCreate[];
}

export interface QuoteRevisionCreate {
  notes?: string;
  quote_version: number;      // optimistic lock on the Quote header
  items: QuoteItemCreate[];
}

export interface QuoteStatusUpdate {
  status: QuoteStatus;
  version: number;            // mandatory for optimistic locking
}

// ─── List query params ─────────────────────────────────────────────────────

export interface QuoteListQueryParams {
  page?: number;
  page_size?: number;
  status?: QuoteStatus;
  dealer_id?: UUID;
  sales_rep_id?: UUID;
  created_at_from?: ISODateString;
  created_at_to?: ISODateString;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

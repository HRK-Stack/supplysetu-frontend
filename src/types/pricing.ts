// src/types/pricing.ts
// SupplySetu — Pricing snapshot and preview types
// All monetary values are in paise (INTEGER). Never float, never Decimal.

import type { UUID } from "./common";

/**
 * The canonical 12-key pricing snapshot stored in quote_items and order_items.
 * ALL 12 keys are always present. Nullable keys are null when not applicable.
 * Values are in paise (integer) unless noted.
 *
 * IMPORTANT: These values must NEVER be recalculated on the frontend.
 * Always display values from the snapshot; call /pricing/preview for live calculations.
 */
export interface PricingSnapshot {
  base_price: number;
  territory_adjustment: number;
  dealer_discount: number;
  volume_discount: number;
  scheme_discount: number;
  applied_scheme_id: string | null;
  applied_slab_id: string | null;
  override_price: number | null;
  final_unit_price: number;
  gst_rate: number;
  hsn_code: string;
  final_price_with_gst: number;
}


export interface PricingPreviewRequest {
  dealer_id: UUID;
  product_id: UUID;
  quantity: number;          // positive integer
  override_price: number | null; // paise; MANAGER/ADMIN only
}

export interface PricingPreviewResponseData {
  readonly pricing_snapshot: PricingSnapshot;
}
export type StrictPricingSnapshot = Required<PricingSnapshot>;

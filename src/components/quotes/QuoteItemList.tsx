"use client";

/*
  ===================================
  FE-025
  Quote Item List
  ===================================
*/

import { Card } from "@/components/ui/Card";

import { formatPaise } from "@/lib/format";
import type { QuoteItem } from "@/types/quote";

interface QuoteItemListProps {
  items: QuoteItem[];
  productMap: Record<
    string,
    string
  >;
}

export default function QuoteItemList({
  items,
  productMap,
}: QuoteItemListProps) {
        const pricingFields = [
        {
            label: "Base Price",
            key: "base_price",
        },
        {
            label:
                "Territory Adjustment",
            key:
                "territory_adjustment",
        },
        {
            label:
                "Dealer Discount",
            key:
                "dealer_discount",
        },
        {
            label:
                "Volume Discount",
            key:
                "volume_discount",
        },
        {
            label:
                "Scheme Discount",
            key:
                "scheme_discount",
        },
        {
            label:
                "Override Price",
            key:
                "override_price",
        },
        {
            label:
                "Final Unit Price",
            key:
                "final_unit_price",
        },
        {
            label:
                "Final Price GST",
            key:
                "final_price_with_gst",
        },
    ] as const;
  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">

      {/* ===================================
          Header
      =================================== */}

      <div className="border-b border-[var(--table-border)] px-6 py-5">
        <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
          Current Revision
          Items
        </h2>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Pricing snapshot
          values from current
          quote revision.
        </p>
      </div>

      {/* ===================================
          Empty State
      =================================== */}

      {items.length ===
      0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            No quote items
            found.
          </p>
        </div>
      ) : (
        <div className="space-y-6 p-6">

          {/* ===================================
              Items
          =================================== */}

          {items.map(
            (
                item: QuoteItem,
                index: number,
            ) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6"
              >

                {/* Item Header */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  {/* Product */}

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--table-header-bg)] font-semibold text-[var(--navy)]">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">
                          {
                            productMap[
                              item.product_id
                            ] ?? item.product_id
                          }
                        </h3>

                        {/* ===================================
                            FE-025 CHANGE:
                            HSN code
                        =================================== */}

                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-lg bg-[var(--card)] px-3 py-1 font-mono text-xs text-[var(--text-primary)]">
                            HSN{" "}
                            {
                              item.pricing_snapshot.hsn_code
                            }
                          </span>

                          <span className="text-xs text-[var(--text-secondary)]">
                            Qty:{" "}
                            {
                              item.quantity
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Totals */}

                  <div className="text-right">
                    <p className="text-sm text-[var(--text-muted)]">
                      Line Total
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-[var(--navy)]">
                      {formatPaise(
                        (
                          item.pricing_snapshot
                            ?.final_unit_price ?? 0
                        ) * item.quantity
                      )}
                    </h2>
                  </div>
                </div>

                {/* ===================================
                    Pricing Snapshot
                    NEVER RECALCULATE
                =================================== */}

                <div className="mt-6">
                  <h4 className="mb-4 font-medium text-[var(--text-primary)]">
                    Pricing Snapshot
                  </h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                    {pricingFields.map(
                      (
                        field,
                      ) => (
                        <div
                          key={
                            field.label
                          }
                          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                        >
                          <p className="text-xs text-[var(--text-muted)]">
                            {
                              field.label
                            }
                          </p>

                          <p className="mt-2 font-semibold text-[var(--text-primary)]">
                            {formatPaise(
                              item.pricing_snapshot?.[
                                field.key
                            ] ?? 0
                            )}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </Card>
  );
}
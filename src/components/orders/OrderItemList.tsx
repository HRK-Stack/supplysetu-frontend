// src/components/orders/OrderItemList.tsx

"use client";

/*
  ===================================
  FE-033
  Order Item List
  ===================================
*/

import { Card } from "@/components/ui/Card";

import PricingBreakdown from "@/components/quotes/PricingBreakdown";

import { formatPaise } from "@/lib/money";
import type {
  OrderItem,
} from "@/types/order";

interface OrderItemListProps {
  items: OrderItem[];
}

export default function OrderItemList({
  items,
}: OrderItemListProps) {

  /*
    ===================================
    FE-033 CHANGE:
    Order total
    ===================================
  */
  const orderTotal =
    items.reduce(
        (
        total: number,
        item: OrderItem,
        ) =>
        total +
        item.line_total,
        0,
    );

  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

      {/* ===================================
          Header
      =================================== */}

      <div className="border-b border-[var(--table-border)] px-6 py-5">

        <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">

          Order Items
        </h2>
      </div>

      {/* ===================================
          Items
      =================================== */}
        {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-6 py-16 text-center">

                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                No Order Items
                </h3>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                No items available
                for this order.
                </p>
            </div>
        )}


      <div className="space-y-6 p-6">

        {items.map(
          (
            item,
            index,
          ) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6"
            >

              {/* ===================================
                  Top
              =================================== */}

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                {/* Left */}

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--table-header-bg)] text-sm font-semibold text-[var(--navy)]">

                      {index + 1}
                    </div>

                    <div>

                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {
                          item.product_name
                        }
                      </h3>

                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        HSN:{" "}
                        {
                          item.hsn_code
                        }
                      </p>
                    </div>
                  </div>

                  {/* Quantity */}

                  <div className="mt-5 flex flex-wrap gap-3">

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2">

                      <p className="text-xs text-[var(--text-muted)]">
                        Quantity
                      </p>

                      <p className="mt-1 font-semibold text-[var(--text-primary)]">
                        {
                          item.quantity
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2">

                      <p className="text-xs text-[var(--text-muted)]">
                        Final Unit
                      </p>

                      <p className="mt-1 font-semibold text-[var(--text-primary)]">

                        {formatPaise(
                          item.final_unit_price,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2">

                      <p className="text-xs text-[var(--text-muted)]">
                        Final With
                        GST
                      </p>

                      <p className="mt-1 font-semibold text-[var(--text-primary)]">

                        {formatPaise(
                          item.final_price_with_gst,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right */}

                <div className="rounded-2xl border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-6 py-5 text-right">

                  <p className="text-sm text-[var(--status-success-text)]">
                    Line Total
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[var(--status-success-text)]">

                    {formatPaise(
                      item.line_total,
                    )}
                  </h2>
                </div>
              </div>

              {/* ===================================
                  Pricing Snapshot
              =================================== */}

              <div className="mt-6">

                {/* ===================================
                    FE-033 CHANGE:
                    Reuse pricing component
                =================================== */}

                {item.pricing_snapshot && (
                    <PricingBreakdown
                        pricingSnapshot={
                        item.pricing_snapshot
                        }
                    />
                )}
              </div>
            </div>
          ),
        )}

        {/* ===================================
            Footer Total
        =================================== */}

        <div className="flex justify-end border-t border-[var(--table-border)] pt-6">

          <div className="rounded-2xl border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-8 py-6 text-right">

            <p className="text-sm text-[var(--status-info-text)]">
              Order Total
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[var(--status-info-text)]">

              {formatPaise(
                orderTotal,
              )}
            </h2>
          </div>
        </div>
      </div>
    </Card>
  );
}
// src/components/orders/OrderTable.tsx

"use client";

/*
  ===================================
  FE-032
  Order Table
  ===================================
*/

import { formatDate, formatPaise } from "@/lib/format";

import { Card } from "@/components/ui/Card";
import type { Order } from "@/types/order";

interface OrderTableProps {
  orders: Order[];

  isLoading?: boolean;

  onRowClick?: (
    orderId: string,
  ) => void;
}

export default function OrderTable({
  orders,
  isLoading,
  onRowClick,
}: OrderTableProps) {

  /*
    ===================================
    FE-032 CHANGE:
    Export badge styles
    ===================================
  */
  const exportBadgeClass = (
    status: string,
  ) => {
    switch (status) {
      case "PENDING":
        return "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]";

      case "EXPORTED":
        return "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]";

      case "FAILED":
        return "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]";

      default:
        return "border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)]";
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

      {/* ===================================
          Header
      =================================== */}

      <div className="border-b border-[var(--table-border)] px-6 py-5">

        <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">

          Order Listing
        </h2>
      </div>

      {/* ===================================
          Table
      =================================== */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-[var(--table-header-bg)]">

            <tr className="border-b border-[var(--table-border)]">

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Order ID
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Quote ID
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Dealer
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Export
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Created
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Total
              </th>
            </tr>
          </thead>

          <tbody>

            {/* ===================================
                Skeletons
            =================================== */}

            {isLoading &&
              Array.from({
                length: 6,
              }).map(
                (
                  _,
                  index,
                ) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--table-border)]"
                  >
                    {Array.from({
                      length: 7,
                    }).map(
                      (
                        __,
                        cellIndex,
                      ) => (
                        <td
                          key={
                            cellIndex
                          }
                          className="px-5 py-5"
                        >
                          <div className="h-4 animate-pulse rounded bg-[var(--table-header-bg)]" />
                        </td>
                      ),
                    )}
                  </tr>
                ),
              )}

            {/* ===================================
                Rows
            =================================== */}

            {!isLoading &&
              orders.map(
                (
                  order,
                ) => (
                  <tr
                    key={order.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      onRowClick?.(
                        order.id,
                      )
                    }
                    onKeyDown={(e) => {
                        if (
                        e.key === "Enter" ||
                        e.key === " "
                        ) {
                        onRowClick?.(
                            order.id,
                        );
                        }
                    }}
                    className="cursor-pointer border-b border-[var(--table-border)] transition-colors duration-200 hover:bg-[var(--table-header-bg)]"
                  >

                    {/* Order ID */}

                    <td className="px-5 py-5 font-medium text-(--navy)">

                      {
                        order.id.slice(0, 8)
                      }
                    </td>

                    {/* Quote ID */}

                    <td className="px-5 py-5 font-medium text-(--text-primary)">

                      {
                        order.quote_id.slice(0, 8)
                      }
                    </td>

                    {/* Dealer */}

                    <td className="px-5 py-5">

                      <div>

                        <p className="font-medium text-(--text-primary)">
                          {
                            order.dealer_name
                          }
                        </p>

                        <p className="mt-1 text-xs text-(--text-secondary)">
                          {
                            order.dealer_gstin
                          }
                        </p>
                      </div>
                    </td>

                    {/* Status */}

                    <td className="px-5 py-5">

                      <span className="rounded-full border border-(--status-info-border) bg-(--status-info-bg) px-3 py-1 text-xs font-semibold text-(--status-info-text)">

                        {
                          order.status
                        }
                      </span>
                    </td>

                    {/* Export */}

                    <td className="px-5 py-5">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${exportBadgeClass(
                          order.export_status,
                        )}`}
                      >

                        {
                          order.export_status
                        }
                      </span>
                    </td>

                    {/* Created */}

                    <td className="px-5 py-5 font-medium text-(--text-secondary)">

                      {formatDate(
                        order.created_at,
                      )}
                    </td>

                    {/* Total */}

                    <td className="px-5 py-5 text-right font-semibold text-[var(--text-primary)]">

                      {formatPaise(
                        order.items?.reduce(
                          (
                            total,
                            item,
                          ) => {
                            return (
                              total +
                              (
                                (
                                  item
                                    .pricing_snapshot
                                    ?.final_price_with_gst ||
                                  0
                                ) * item.quantity
                              )
                            );
                          },

                          0,
                        ) || 0,
                      )}
                    </td>
                  </tr>
                ),
              )}

            {/* ===================================
                Empty State
            =================================== */}

            {!isLoading &&
              orders.length ===
                0 && (
                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >

                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      No Orders Found
                    </h3>

                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Try adjusting
                      your filters.
                    </p>
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
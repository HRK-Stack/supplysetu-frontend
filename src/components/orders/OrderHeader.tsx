// src/components/orders/OrderHeader.tsx

"use client";

/*
  ===================================
  FE-033
  Order Header
  ===================================
*/

import {
  useMutation,
} from "@tanstack/react-query";

import {
  Calendar,
  FileText,
  PackageCheck,
  Truck,
} from "lucide-react";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useAuth } from "@/hooks/useAuth";

import { formatDate } from "@/lib/date";
import type { Order } from "@/types/order";

interface OrderHeaderProps {
  order: Order;

  onRefresh?: () => void;
}
interface ExportOrderResponse {
  success: boolean;

  data?: {
    export_reference?: string;
  };
}
export default function OrderHeader({
  order,
  onRefresh,
}: OrderHeaderProps) {
  const { user } =
    useAuth();

  /*
    ===================================
    FE-033 CHANGE:
    Export permissions
    ===================================
  */
  const canExport =
    user?.role ===
      "ADMIN" ||
    user?.role ===
      "MANAGER";

  /*
    ===================================
    FE-033 CHANGE:
    Export mutation
    ===================================
  */
  const exportMutation =
    useMutation<
        ExportOrderResponse,
        Error
    >({
      mutationFn:
        async () => {
          const response =
            await api.post<ExportOrderResponse>(
              `/orders/${order.id}/export`,
            );

          return response.data;
        },

    onSuccess: () => {
        onRefresh?.();
    },

    onError: () => {
        alert(
            "Failed to export order.",
        );
    },
    });

  /*
    ===================================
    FE-033 CHANGE:
    Export status styles
    ===================================
  */
  const exportBadgeClass =
    order.export_status ===
    "EXPORTED"
      ? "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : order.export_status ===
        "FAILED"
      ? "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]"
      : "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]";

  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">

      {/* ===================================
          Top Section
      =================================== */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

        {/* ===================================
            Left
        =================================== */}

        <div className="space-y-5">

          {/* Title */}

          <div>

            <h1 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--text-primary)]">

              {
                order.order_number
              }
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Order detail,
              export tracking
              and pricing
              snapshot view.
            </p>
          </div>

          {/* Meta Grid */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            {/* Quote */}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">

              <div className="flex items-center gap-2">

                <FileText className="h-4 w-4 text-[var(--navy)]" />

                <p className="text-xs text-[var(--text-muted)]">
                  Quote ID
                </p>
              </div>

              <p className="mt-2 font-semibold text-[var(--text-primary)]">
                {
                  order.quote_number
                }
              </p>
            </div>

            {/* Dealer */}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">

              <div className="flex items-center gap-2">

                <PackageCheck className="h-4 w-4 text-[var(--navy)]" />

                <p className="text-xs text-[var(--text-muted)]">
                  Dealer
                </p>
              </div>

              <p className="mt-2 font-semibold text-[var(--text-primary)]">
                {
                  order.dealer_name
                }
              </p>

              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {
                  order.dealer_gstin
                }
              </p>
            </div>

            {/* Sales Rep */}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">

              <div className="flex items-center gap-2">

                <Truck className="h-4 w-4 text-[var(--navy)]" />

                <p className="text-xs text-[var(--text-muted)]">
                  Sales Rep
                </p>
              </div>

              <p className="mt-2 font-semibold text-[var(--text-primary)]">
                {
                  order.sales_rep_name
                }
              </p>
            </div>

            {/* Created */}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">

              <div className="flex items-center gap-2">

                <Calendar className="h-4 w-4 text-[var(--navy)]" />

                <p className="text-xs text-[var(--text-muted)]">
                  Created
                </p>
              </div>

              <p className="mt-2 font-semibold text-[var(--text-primary)]">
                {formatDate(
                  order.created_at,
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ===================================
            Right
        =================================== */}

        <div className="flex flex-col items-start gap-4 lg:items-end">

          {/* Status */}

          <div className="flex flex-wrap items-center gap-3">

            <span className="rounded-full border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-4 py-2 text-sm font-semibold text-[var(--status-info-text)]">

              {
                order.status
              }
            </span>

            <span
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${exportBadgeClass}`}
            >

              {
                order.export_status
              }
            </span>
          </div>

          {/* ===================================
              FE-033 CHANGE:
              Export Action
          =================================== */}

          {canExport &&
            (
              order.export_status ===
                "PENDING" ||
              order.export_status ===
                "FAILED"
            ) && (
              <Button
                type="button"
                onClick={() =>
                  exportMutation.mutate()
                }
                disabled={
                  exportMutation.isPending
                }
              >
                {exportMutation.isPending
                  ? "Exporting..."
                  : "Trigger Export"}
              </Button>
            )}

          {/* ===================================
              FE-033 CHANGE:
              Export reference
          =================================== */}

          {order.export_status ===
            "EXPORTED" && (
            <div className="rounded-2xl border border-[var(--status-success-border)] bg-[var(--status-success-bg)] p-4 text-right">

              <p className="text-xs text-[var(--status-success-text)]">
                Export Reference
              </p>

              <p className="mt-1 font-semibold text-[var(--status-success-text)]">
                {
                  order.export_reference
                }
              </p>

              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Exported on{" "}
                {formatDate(
                  order.exported_at,
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===================================
          Ship To Address
      =================================== */}

      {order.ship_to_address && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

          <h3 className="font-semibold text-[var(--text-primary)]">
            Ship-To Address
          </h3>

          <div className="mt-3 space-y-1 text-sm text-[var(--text-secondary)]">

            <p>
              {
                order
                  .ship_to_address
                  .label
              }
            </p>

            <p>
              {
                order
                  .ship_to_address
                  .address_line1
              }
            </p>

            {order
              .ship_to_address
              .address_line2 && (
              <p>
                {
                  order
                    .ship_to_address
                    .address_line2
                }
              </p>
            )}

            <p>
              {
                order
                  .ship_to_address
                  .city
              }
              ,{" "}
              {
                order
                  .ship_to_address
                  .state
              }{" "}
              -{" "}
              {
                order
                  .ship_to_address
                  .pincode
              }
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
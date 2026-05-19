// src/app/(dashboard)/orders/export/page.tsx

"use client";

/*
  ===================================
  FE-034
  Export Orders Page
  ===================================
*/

import { useState } from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Download,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Search,
} from "lucide-react";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { formatDate } from "@/lib/format";

import type {
  Order,
  ExportStatus,
} from "@/types/order";

import type {
  PaginatedResponse,
} from "@/types/common";

export default function ExportOrdersPage() {
  const router =
    useRouter();

  const queryClient =
    useQueryClient();

  /*
    ===================================
    State
    ===================================
  */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    exportStatus,
    setExportStatus,
  ] = useState<
    ExportStatus | ""
  >("");

  /*
    ===================================
    Orders Query
    ===================================
  */

  const {
    data,
    isLoading,
    refetch,
  } = useQuery<
    PaginatedResponse<Order>
  >({
    queryKey: [
      "export-orders",
      search,
      exportStatus,
    ],

    queryFn: async () => {
      const response =
        await api.get(
          "/orders",
          {
            params: {
              page: 1,
              page_size: 50,

              export_status:
                exportStatus ||
                undefined,

              search:
                search ||
                undefined,
            },
          },
        );

      return response.data;
    },
  });

  const orders =
    data?.success
      ? data.data
      : [];

  /*
    ===================================
    Export Mutation
    ===================================
  */

  const exportMutation =
    useMutation({
      mutationFn: async (
        orderId: string,
      ) => {
        return api.post(
          `/orders/${orderId}/export`,
        );
      },

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "export-orders",
          ],
        });

        void refetch();
      },
    });

  /*
    ===================================
    Bulk Export
    ===================================
  */

  const handleBulkExport =
    async () => {
      const pendingOrders =
        orders.filter(
          (
            order,
          ) =>
            order.export_status ===
            "PENDING",
        );

      for (
        const order of pendingOrders
      ) {
        try {
          await exportMutation.mutateAsync(
            order.id,
          );
        } catch {
          console.error(
            `Export failed for ${order.order_number}`,
          );
        }
      }
    };

  /*
    ===================================
    Badge Styles
    ===================================
  */

  const exportBadgeClass = (
    status: ExportStatus,
  ) => {
    switch (status) {
      case "EXPORTED":
        return "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]";

      case "FAILED":
        return "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]";

      default:
        return "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]";
    }
  };

  /*
    ===================================
    Stats
    ===================================
  */

  const pendingCount =
    orders.filter(
      (
        order,
      ) =>
        order.export_status ===
        "PENDING",
    ).length;

  const exportedCount =
    orders.filter(
      (
        order,
      ) =>
        order.export_status ===
        "EXPORTED",
    ).length;

  const failedCount =
    orders.filter(
      (
        order,
      ) =>
        order.export_status ===
        "FAILED",
    ).length;

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Order Exports
          </h1>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage Tally exports,
            export history and
            failed export retries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <Button
            variant="secondary"
            onClick={() => {
              void refetch();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={() => {
              void handleBulkExport();
            }}
            disabled={
              exportMutation.isPending
            }
          >
            <Download className="h-4 w-4" />
            Export Pending
          </Button>
        </div>
      </div>

      {/* ===================================
          Stats
      =================================== */}

      <div className="grid gap-4 md:grid-cols-3">

        <Card className="rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-[var(--status-warning-text)]">
                Pending
              </p>

              <h2 className="mt-2 text-4xl font-bold text-[var(--status-warning-text)]">
                {pendingCount}
              </h2>
            </div>

            <Clock3 className="h-10 w-10 text-[var(--status-warning-text)]" />
          </div>
        </Card>

        <Card className="rounded-2xl border border-[var(--status-success-border)] bg-[var(--status-success-bg)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-[var(--status-success-text)]">
                Exported
              </p>

              <h2 className="mt-2 text-4xl font-bold text-[var(--status-success-text)]">
                {exportedCount}
              </h2>
            </div>

            <CheckCircle2 className="h-10 w-10 text-[var(--status-success-text)]" />
          </div>
        </Card>

        <Card className="rounded-2xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-[var(--status-danger-text)]">
                Failed
              </p>

              <h2 className="mt-2 text-4xl font-bold text-[var(--status-danger-text)]">
                {failedCount}
              </h2>
            </div>

            <AlertTriangle className="h-10 w-10 text-[var(--status-danger-text)]" />
          </div>
        </Card>
      </div>

      {/* ===================================
          Filters
      =================================== */}

      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">

        <div className="grid gap-4 lg:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Search Orders
            </label>

            <div className="relative">

              <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value,
                  );
                }}
                placeholder="Search order number..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--navy)]"
              />
            </div>
          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Export Status
            </label>

            <select
              value={exportStatus}
              onChange={(e) => {
                setExportStatus(
                  e.target.value as
                    | ExportStatus
                    | "",
                );
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--navy)]"
            >
              <option value="">
                All Statuses
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="EXPORTED">
                Exported
              </option>

              <option value="FAILED">
                Failed
              </option>
            </select>
          </div>
        </div>
      </Card>

      {/* ===================================
          Export Table
      =================================== */}

      <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

        <div className="border-b border-[var(--table-border)] px-6 py-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Export Queue
              </h2>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Orders ready for Tally export.
              </p>
            </div>

            <FileSpreadsheet className="h-6 w-6 text-[var(--navy)]" />
          </div>
        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-[var(--table-header-bg)]">

              <tr className="border-b border-[var(--table-border)]">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Order
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Dealer
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Created
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

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
                        length: 5,
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

              {!isLoading &&
                orders.map(
                  (
                    order,
                  ) => (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--table-border)] transition-colors duration-200 hover:bg-[var(--table-header-bg)]"
                    >

                      <td className="px-5 py-5">

                        <button
                          onClick={() => {
                            router.push(
                              `/orders/${order.id}`,
                            );
                          }}
                          className="font-semibold text-[var(--navy)] transition-opacity hover:opacity-80"
                        >
                          {
                            order.order_number
                          }
                        </button>
                      </td>

                      <td className="px-5 py-5">

                        <div>

                          <p className="font-medium text-[var(--text-primary)]">
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
                      </td>

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

                      <td className="px-5 py-5 text-sm text-[var(--text-secondary)]">

                        {formatDate(
                          order.created_at,
                        )}
                      </td>

                      <td className="px-5 py-5">

                        <div className="flex justify-end gap-3">

                          <Button
                            variant="secondary"
                            onClick={() => {
                              router.push(
                                `/orders/${order.id}`,
                              );
                            }}
                          >
                            View
                          </Button>

                          <Button
                            disabled={
                              exportMutation.isPending
                            }
                            onClick={() => {
                              exportMutation.mutate(
                                order.id,
                              );
                            }}
                          >
                            Export
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}

              {!isLoading &&
                orders.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >

                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        No Orders Found
                      </h3>

                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        No exportable
                        orders available.
                      </p>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
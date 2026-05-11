// src/components/orders/ExportTrigger.tsx

"use client";

/*
  ===================================
  FE-034
  Tally Export Trigger
  ===================================
*/

import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  CheckCircle2,
  Loader2,
  ShieldAlert,
  UploadCloud,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useAuth } from "@/hooks/useAuth";
import type { AxiosError } from "axios";

interface ExportTriggerProps {
  orderId: string;

  exportStatus: string;

  onRefresh?: () => void;
}

interface OrderExportResponse {
  data: {
    export_status: string;
  };
}

export default function ExportTrigger({
  orderId,
  exportStatus,
  onRefresh,
}: ExportTriggerProps) {
  const { user } =
    useAuth();

  /*
    ===================================
    FE-034 CHANGE:
    MANAGER/ADMIN only
    ===================================
  */
  const canExport =
    user?.role ===
      "ADMIN" ||
    user?.role ===
      "MANAGER";

  /*
    ===================================
    FE-034 CHANGE:
    Polling state
    ===================================
  */
  const [
    isPolling,
    setIsPolling,
  ] = useState(false);

  /*
    ===================================
    FE-034 CHANGE:
    Poll order status
    every 5 seconds
    ===================================
  */
  const {
    data: orderData,
  } = useQuery<OrderExportResponse>({
    enabled:
      isPolling,

    queryKey: [
      "order-export-status",
      orderId,
    ],

    refetchInterval: 5000,
    refetchIntervalInBackground: false,

    queryFn: async () => {
      const response =
        await api.get<OrderExportResponse>(
          `/orders/${orderId}`,
        );

      return response.data;
    },
  });

  /*
    ===================================
    FE-034 CHANGE:
    Auto stop polling
    ===================================
  */
  useEffect(() => {
    const status =
      orderData?.data
        ?.export_status;

    if (
      status ===
        "EXPORTED" ||
      status === "FAILED"
    ) {
      setIsPolling(false);

      onRefresh?.();
    }
  }, [
    orderData,
    onRefresh,
  ]);

  /*
    ===================================
    FE-034 CHANGE:
    Trigger export
    ===================================
  */
  const exportMutation =
    useMutation<
        unknown,
        AxiosError<{
        code?: string;
        items?: string[];
        }>
    >({
      mutationFn:
        async () => {
          const response =
            await api.post<OrderExportResponse>(
              `/orders/${orderId}/export`,
            );

          return response.data;
        },

      /*
        ===================================
        FE-034 CHANGE:
        Export queued
        ===================================
      */
      onSuccess: () => {
        alert(
          "Export enqueued",
        );

        setIsPolling(true);

        onRefresh?.();
      },

      /*
        ===================================
        FE-034 CHANGE:
        HSN validation
        ===================================
      */
      onError: (
        error: AxiosError<{
            code?: string;
            items?: string[];
        }>,
        ) => {
        const code =
          error?.response
            ?.data?.code;

        /*
          ===================================
          HSN_CODE_MISSING
          ===================================
        */
        if (
          code ===
          "HSN_CODE_MISSING"
        ) {
          const missingItems =
            error?.response
              ?.data
              ?.items ?? [];

          alert(
            `Missing HSN codes:\n\n${missingItems.join(
              "\n",
            )}`,
          );
        }
      },
    });

  /*
    ===================================
    FE-034 CHANGE:
    Live status
    ===================================
  */
  const currentStatus =
    orderData?.data
      ?.export_status ||
    exportStatus;

  /*
    ===================================
    FE-034 CHANGE:
    Only show for
    pending/failed
    ===================================
  */
  const canTrigger =
    currentStatus ===
      "PENDING" ||
    currentStatus ===
      "FAILED";

  /*
    ===================================
    FE-034 CHANGE:
    Hide unauthorized
    ===================================
  */
  if (!canExport) {
    return null;
    }

  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* ===================================
            Left
        =================================== */}

        <div>

          <div className="flex items-center gap-3">

            {/* Pending */}

            {currentStatus ===
              "PENDING" && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--status-warning-bg)]">

                <UploadCloud className="h-5 w-5 text-[var(--status-warning-text)]" />
              </div>
            )}

            {/* Failed */}

            {currentStatus ===
              "FAILED" && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--status-danger-bg)]">

                <XCircle className="h-5 w-5 text-[var(--status-danger-text)]" />
              </div>
            )}

            {/* Polling */}

            {isPolling && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--status-info-bg)]">

                <Loader2 className="h-5 w-5 animate-spin text-[var(--status-info-text)]" />
              </div>
            )}

            <div>

              <h3 className="font-semibold text-[var(--text-primary)]">

                Tally Export
              </h3>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">

                {isPolling
                  ? "Export in progress..."
                  : currentStatus ===
                    "FAILED"
                  ? "Previous export failed."
                  : "Ready for Tally export."}
              </p>
            </div>
          </div>

          {/* ===================================
              Export Progress
          =================================== */}

          {isPolling && (
            <div className="mt-4">

              <div className="h-2 overflow-hidden rounded-full bg-[var(--table-header-bg)]">

                <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--status-info-text)]" />
              </div>

              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Polling export
                status every 5
                seconds...
              </p>
            </div>
          )}
        </div>

        {/* ===================================
            Right
        =================================== */}

        <div className="flex items-center gap-3">

          {/* Exported Success */}

          {currentStatus ===
            "EXPORTED" && (
            <div className="flex items-center gap-2 rounded-full border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-4 py-2 text-sm font-semibold text-[var(--status-success-text)]">

              <CheckCircle2 className="h-4 w-4" />

              Exported
            </div>
          )}

          {/* Failed State */}

          {currentStatus ===
            "FAILED" && (
            <div className="flex items-center gap-2 rounded-full border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--status-danger-text)]">

              <ShieldAlert className="h-4 w-4" />

              Failed
            </div>
          )}

          {/* ===================================
              FE-034 CHANGE:
              Trigger export
          =================================== */}

          <Button
            type="button"
            disabled={
                !canTrigger ||
                exportMutation.isPending ||
                isPolling
            }

            onClick={() =>
              exportMutation.mutate()
            }
          >
            {exportMutation.isPending
              ? "Queueing..."
              : isPolling
              ? "Exporting..."
              : "Trigger Tally Export"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
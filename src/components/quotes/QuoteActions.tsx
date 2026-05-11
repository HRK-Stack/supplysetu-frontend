// src/components/quotes/QuoteActions.tsx

"use client";

/*
  ===================================
  FE-027
  Quote Status Transitions
  ===================================
*/

import { useState } from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CheckCircle2,
  RefreshCcw,
  Send,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import type { Quote } from "@/types/quote";
import { AxiosError } from "axios";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useAuth } from "@/hooks/useAuth";

interface QuoteActionsProps {
  quote: Quote;

  onRefresh?: () => void;
}

export default function QuoteActions({
  quote,
  onRefresh,
}: QuoteActionsProps) {
  const queryClient =
    useQueryClient();

  const { user } = useAuth();

  /*
    ===================================
    FE-027 CHANGE:
    Confirmation modal state
    ===================================
  */
  const [
    pendingAction,
    setPendingAction,
  ] = useState<
    | null
    | {
        label: string;
        action: string;
        nextStatus: string;
      }
  >(null);

  /*
    ===================================
    FE-027 CHANGE:
    Expiry validation
    ===================================
  */
  const validUntil =
    new Date(
      quote.valid_until,
    );

  const isExpired =
    validUntil.getTime() <
    Date.now();

    

  /*
    ===================================
    FE-027 CHANGE:
    Quote transition mutation
    ===================================
  */
  const transitionMutation =
    useMutation<
        unknown,
        AxiosError<{
        code?: string;
        }>,
        {
        action: string;
        nextStatus: string;
        }
    >({
      mutationFn: async ({
        action,
        nextStatus,
      }: {
        action: string;
        nextStatus: string;
      }) => {
        /*
          ===================================
          FE-027 CHANGE:
          Convert to order
          ===================================
        */
        if (
          action ===
          "CONVERT_TO_ORDER"
        ) {
          const response =
            await api.post(
              "/orders",
              {
                quote_id:
                  quote.id,
              },
            );

          return response.data;
        }

        /*
          ===================================
          FE-027 CHANGE:
          Status transition
          ===================================
        */
        const response =
          await api.patch(
            `/quotes/${quote.id}/status`,
            {
              status:
                nextStatus,
            },
          );

        return response.data;
      },

      /*
        ===================================
        FE-027 CHANGE:
        Success handling
        ===================================
      */
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          {
            queryKey: [
              "quote-detail",
              quote.id,
            ],
          },
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
              "quotes",
            ],
          },
        );

        setPendingAction(
          null,
        );

        onRefresh?.();
      },

      /*
        ===================================
        FE-027 CHANGE:
        409 handling
        ===================================
      */
     
      onError: (
        error: unknown,
      ) => {
        /*
          NEVER auto retry
        */
       const axiosError =
        error as AxiosError<{
            code?: string;
        }>;

        if (
          axiosError?.response
            ?.status ===
          409
        ) {
          alert(
            "Quote updated by another user. Please refresh.",
          );

          onRefresh?.();
        }

        /*
          QUOTE_EXPIRED
        */
        if (
            axiosError.response
                ?.data
                ?.code ===
            "QUOTE_EXPIRED"
            ) {
          alert(
            "Quote expired. Create a new revision.",
          );
        }
      },
    });

  /*
    ===================================
    FE-027 CHANGE:
    Role helpers
    ===================================
  */
  const isManager =
    user?.role ===
      "MANAGER" ||
    user?.role ===
      "ADMIN";

  const isSalesRep =
    user?.role ===
    "SALES_REP";

  /*
    ===================================
    FE-027 CHANGE:
    State machine
    ===================================
  */
  const actions: {
    label: string;
    action: string;
    nextStatus: string;
    icon: LucideIcon;
    variant:
      | "primary"
      | "success"
      | "danger"
      | "warning";
  }[] = [];

  /*
    ===================================
    DRAFT
    ===================================
  */
  if (
    quote.status ===
      "DRAFT" &&
    (
      isSalesRep ||
      isManager
    )
  ) {
    actions.push({
      label: "Send Quote",

      action: "SEND",

      nextStatus:
        "SENT",

      icon: Send,

      variant:
        "primary",
    });
  }

  /*
    ===================================
    SENT
    ===================================
  */
  if (
    quote.status ===
      "SENT" &&
    isManager &&
    !isExpired
  ) {
    actions.push(
      {
        label: "Accept",

        action:
          "ACCEPT",

        nextStatus:
          "ACCEPTED",

        icon:
          CheckCircle2,

        variant:
          "success",
      },

      {
        label: "Reject",

        action:
          "REJECT",

        nextStatus:
          "REJECTED",

        icon: XCircle,

        variant:
          "danger",
      },

      {
        label:
          "Negotiate",

        action:
          "NEGOTIATE",

        nextStatus:
          "NEGOTIATION",

        icon:
          RefreshCcw,

        variant:
          "warning",
      },
    );
  }

  /*
    ===================================
    NEGOTIATION
    ===================================
  */
  if (
    quote.status ===
      "NEGOTIATION" &&
    isManager &&
    !isExpired
  ) {
    actions.push(
      {
        label: "Accept",

        action:
          "ACCEPT",

        nextStatus:
          "ACCEPTED",

        icon:
          CheckCircle2,

        variant:
          "success",
      },

      {
        label: "Reject",

        action:
          "REJECT",

        nextStatus:
          "REJECTED",

        icon: XCircle,

        variant:
          "danger",
      },

      {
        label:
          "Re-send",

        action:
          "RESEND",

        nextStatus:
          "SENT",

        icon: Send,

        variant:
          "primary",
      },
    );
  }

  /*
    ===================================
    ACCEPTED
    ===================================
  */
  if (
    quote.status ===
      "ACCEPTED" &&
    !isExpired
  ) {
    actions.push({
      label:
        "Convert to Order",

      action:
        "CONVERT_TO_ORDER",

      nextStatus:
        "CONVERTED_TO_ORDER",

      icon:
        CheckCircle2,

      variant:
        "success",
    });
  }

  /*
    ===================================
    FE-027 CHANGE:
    Terminal states
    No actions
    ===================================
  */

  if (
    actions.length === 0
  ) {
    return null;
  }

  return (
    <>
      {/* ===================================
          Actions Panel
      =================================== */}

      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Left */}

          <div>
            <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
              Quote Actions
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Available actions
              based on current
              quote state.
            </p>
          </div>

          {/* Right */}

          <div className="flex flex-wrap gap-3">

            {actions.map(
              (
                action,
              ) => {
                const Icon =
                  action.icon;

                return (
                  <Button
                    type="button"
                    key={
                      action.action
                    }

                    /*
                      ===================================
                      FE-027 CHANGE:
                      Confirmation modal
                      ===================================
                    */
                    onClick={() =>
                      setPendingAction(
                        action,
                      )
                    }

                    disabled={
                      transitionMutation.isPending
                    }

                    className={
                      action.variant ===
                      "success"
                        ? "border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)] hover:bg-[var(--green-light)]"
                        : action.variant ===
                          "danger"
                        ? "border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] hover:bg-[var(--red-light)]"
                        : action.variant ===
                          "warning"
                        ? "border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] hover:bg-[var(--amber-light)]"
                        : ""
                    }
                  >
                    <Icon className="h-4 w-4" />

                    {
                      action.label
                    }
                  </Button>
                );
              },
            )}
          </div>
        </div>

        {/* ===================================
            Expiry Warning
        =================================== */}

        {isExpired && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-[var(--status-warning-text)]" />

            <div>
              <h3 className="font-medium text-[var(--status-warning-text)]">
                Quote Expired
              </h3>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Expired quotes
                cannot be
                accepted or
                converted.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* ===================================
          Confirmation Modal
      =================================== */}

      {pendingAction && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[rgba(15,23,42,0.4)] p-4">

          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-lg)]">

            <h2 className="font-[var(--font-heading)] text-2xl font-semibold text-[var(--text-primary)]">
              Confirm Action
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              Are you sure you
              want to{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {
                  pendingAction.label
                }
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setPendingAction(
                    null,
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() =>
                  transitionMutation.mutate(
                    pendingAction,
                  )
                }

                disabled={
                  transitionMutation.isPending
                }
              >
                {transitionMutation.isPending
                  ? "Processing..."
                  : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
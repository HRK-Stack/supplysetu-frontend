// src/components/quotes/PricingBreakdown.tsx

"use client";

/*
  ===================================
  FE-026
  Pricing Breakdown Panel
  ===================================
*/

import {
  ArrowRight,
  BadgePercent,
  Calculator,
  Receipt,
  Tag,
} from "lucide-react";

import { Card } from "@/components/ui/Card";

import { formatPaise } from "@/lib/format";

import type {
  PricingSnapshot,
} from "@/types/pricing";

interface PricingBreakdownProps {
  pricingSnapshot: PricingSnapshot;
}

export default function PricingBreakdown({
  pricingSnapshot,
}: PricingBreakdownProps) {

  /*
    ===================================
    FE-026 CHANGE:
    Pure display component
    No calculations
    ===================================
  */


  interface PricingFlowItem {
  key: string;

  label: string;

  value:
    | number
    | null;

  icon: React.ComponentType<{
    className?: string;
  }>;

  type:
    | "base"
    | "adjustment"
    | "discount"
    | "override"
    | "final"
    | "gst"
    | "grand";

  isRate?: boolean;
}
  const pricingFlow:
    PricingFlowItem[] = [
      {
        key: "base_price",
        label: "Base Price",
        value:
          pricingSnapshot.base_price,

        icon: Receipt,

        type: "base",
      },

      {
        key:
          "territory_adjustment",

        label:
          "Territory Adjustment",

        value:
          pricingSnapshot.territory_adjustment,

        icon: Calculator,

        type: "adjustment",
      },

      {
        key:
          "dealer_discount",

        label:
          "Dealer Discount",

        value:
          pricingSnapshot.dealer_discount,

        icon: Tag,

        type: "discount",
      },

      {
        key:
          "volume_discount",

        label:
          "Volume Discount",

        value:
          pricingSnapshot.volume_discount,

        icon: Tag,

        type: "discount",
      },

      {
        key:
          "scheme_discount",

        label:
          "Scheme Discount",

        value:
          pricingSnapshot.scheme_discount,

        icon: Tag,

        type: "discount",
      },

      {
        key:
          "override_price",

        label:
          "Override Price",

        value:
          pricingSnapshot.override_price,

        icon: Calculator,

        type: "override",
      },

      {
        key:
          "final_unit_price",

        label:
          "Final Unit Price",

        value:
          pricingSnapshot.final_unit_price,

        icon: Receipt,

        type: "final",
      },

      {
        key: "gst_rate",

        label: "GST Rate",

        value:
          pricingSnapshot.gst_rate,

        icon: BadgePercent,

        type: "gst",

        isRate: true,
      },

      {
        key:
          "final_price_with_gst",

        label:
          "Final Price With GST",

        value:
          pricingSnapshot.final_price_with_gst,

        icon: Receipt,

        type: "grand",
      },
    ];

  /*
    ===================================
    FE-026 CHANGE:
    Applied scheme/slab IDs
    ===================================
  */

  const appliedSchemeIds =
    pricingSnapshot.applied_scheme_id
      ? [
          pricingSnapshot.applied_scheme_id,
        ]
      : [];

  const appliedSlabIds =
    pricingSnapshot.applied_slab_id
      ? [
          pricingSnapshot.applied_slab_id,
        ]
      : [];

  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">

      {/* ===================================
          Header
      =================================== */}

      <div className="mb-6">
        <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
          Pricing Breakdown
        </h2>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Pricing engine
          snapshot breakdown
          with audit trail.
        </p>
      </div>

      {/* ===================================
          HSN + GST Header
      =================================== */}

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 lg:flex-row lg:items-center lg:justify-between">

        {/* HSN */}

        <div>
          <p className="mb-2 text-sm text-[var(--text-muted)]">
            HSN Code
          </p>

          <span className="rounded-xl bg-[var(--card)] px-4 py-2 font-mono text-lg font-semibold tracking-wide text-[var(--text-primary)] shadow-sm">
            {
              pricingSnapshot.hsn_code
            }
          </span>
        </div>

        {/* GST */}

        <div>
          <p className="mb-2 text-sm text-[var(--text-muted)]">
            GST Rate
          </p>

          <span className="rounded-full border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-4 py-2 text-sm font-semibold text-[var(--status-info-text)]">
            {
              pricingSnapshot.gst_rate
            }
            %
          </span>
        </div>
      </div>

      {/* ===================================
          Pricing Flow
      =================================== */}

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-center gap-4">

          {pricingFlow.map(
            (
              item,
              index,
            ) => {
              const Icon =
                item.icon;

              const isDiscount =
                item.type ===
                  "discount" &&
                Boolean(
                  item.value,
                );

              const isAdjustment =
                item.type ===
                  "adjustment" &&
                Boolean(
                  item.value,
                );

              const isOverride =
                item.type ===
                  "override" &&
                Boolean(
                  item.value,
                );

              return (
                <div
                  key={item.key}
                  className="flex items-center gap-4"
                >

                  {/* ===================================
                      Pricing Card
                  =================================== */}

                  <div
                    className={`min-w-[220px] rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
                      isOverride
                        ? "border-[var(--status-purple-border)] bg-[var(--status-purple-bg)]"
                        : isDiscount
                        ? "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]"
                        : isAdjustment
                        ? "border-[var(--status-info-border)] bg-[var(--status-info-bg)]"
                        : "border-[var(--border)] bg-[var(--card)]"
                    }`}
                  >

                    {/* Icon */}

                    <div className="mb-4 flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          isOverride
                            ? "bg-[var(--status-purple-bg)] text-[var(--status-purple-text)]"
                            : isDiscount
                            ? "bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]"
                            : isAdjustment
                            ? "bg-[var(--status-info-bg)] text-[var(--status-info-text)]"
                            : "bg-[var(--table-header-bg)] text-[var(--navy)]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Step Number */}

                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        Step{" "}
                        {index + 1}
                      </span>
                    </div>

                    {/* Label */}

                    <p className="text-sm text-[var(--text-secondary)]">
                      {item.label}
                    </p>

                    {/* Value */}

                    <div className="mt-3">

                      {/* GST Rate */}

                      {item.isRate ? (
                        <span className="rounded-full border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-1 text-sm font-semibold text-[var(--status-info-text)]">
                          {
                            item.value
                          }
                          %
                        </span>
                      ) : (
                        <h3
                          className={`text-2xl font-bold ${
                            isOverride
                              ? "text-[var(--status-purple-text)]"
                              : isDiscount
                              ? "text-[var(--status-danger-text)]"
                              : isAdjustment
                              ? "text-[var(--status-info-text)]"
                              : "text-[var(--text-primary)]"
                          }`}
                        >
                          {formatPaise(
                            item.value ??
                              0,
                          )}
                        </h3>
                      )}
                    </div>

                    {/* Override Highlight */}

                    {isOverride && (
                      <div className="mt-4 rounded-xl border border-[var(--status-purple-border)] bg-[var(--card)] px-3 py-2">
                        <p className="text-xs font-medium text-[var(--status-purple-text)]">
                          Manual override
                          applied
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ===================================
                      Flow Arrow
                  =================================== */}

                  {index !==
                    pricingFlow.length -
                      1 && (
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* ===================================
          Applied Audit IDs
      =================================== */}

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Applied Schemes */}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

          <h3 className="mb-4 font-semibold text-[var(--text-primary)]">
            Applied Scheme IDs
          </h3>

          {appliedSchemeIds.length ===
          0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No schemes
              applied.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {appliedSchemeIds.map(
                (
                  id: string,
                ) => (
                  <span
                    key={id}
                    className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-1 font-mono text-xs text-[var(--status-info-text)]"
                  >
                    {id}
                  </span>
                ),
              )}
            </div>
          )}
        </div>

        {/* Applied Slabs */}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

          <h3 className="mb-4 font-semibold text-[var(--text-primary)]">
            Applied Slab IDs
          </h3>

          {appliedSlabIds.length ===
          0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No slabs
              applied.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {appliedSlabIds.map(
                (
                  id: string,
                ) => (
                  <span
                    key={id}
                    className="rounded-lg border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-3 py-1 font-mono text-xs text-[var(--status-success-text)]"
                  >
                    {id}
                  </span>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
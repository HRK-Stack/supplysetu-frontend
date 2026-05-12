// src/components/quotes/PriceOverrideModal.tsx

"use client";

/*
  ===================================
  FE-029
  Price Override Form
  ===================================
*/

import { useState } from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  BadgeIndianRupee,
  Calendar,
  ShieldAlert,
} from "lucide-react";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { useAuth } from "@/hooks/useAuth";

import { formatPaise } from "@/lib/format";

interface PriceOverrideModalProps {
  open: boolean;

  onClose: () => void;

  dealerId: string;

  productId: string;

  productName: string;

  /*
    ===================================
    FE-029 CHANGE:
    Current computed price
    ===================================
  */
  currentComputedPrice: number;

  /*
    ===================================
    FE-029 CHANGE:
    Refresh pricing preview
    ===================================
  */
  onSuccess?: () => void;
}

export default function PriceOverrideModal({
  open,
  onClose,
  dealerId,
  productId,
  productName,
  currentComputedPrice,
  onSuccess,
}: PriceOverrideModalProps) {
  const queryClient =
    useQueryClient();

  const { user } = useAuth();

  /*
    ===================================
    FE-029 CHANGE:
    MANAGER/ADMIN only
    ===================================
  */
  const canOverride =
    user?.role ===
      "ADMIN" ||
    user?.role ===
      "MANAGER";

  /*
    ===================================
    FE-029 CHANGE:
    Form state
    ===================================
  */
  const [
    overridePrice,
    setOverridePrice,
  ] = useState("");

  const [reason, setReason] =
    useState("");

  const [
    validFrom,
    setValidFrom,
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0],
  );

  const [
    validUntil,
    setValidUntil,
  ] = useState(
    new Date(
      Date.now() +
        1000 *
          60 *
          60 *
          24 *
          30,
    )
      .toISOString()
      .split("T")[0],
  );

  /*
    ===================================
    FE-029 CHANGE:
    Validation
    ===================================
  */
  const parsedPrice =
    Number(
      overridePrice,
    );

  const isInvalidPrice =
    overridePrice !==
      "" &&
    (
      Number.isNaN(
        parsedPrice,
      ) ||
      parsedPrice < 0
    );

    const isInvalidDateRange =
        new Date(validUntil) <
        new Date(validFrom);

  /*
    ===================================
    FE-029 CHANGE:
    Create override
    ===================================
  */
  const createOverrideMutation =
    useMutation({
      mutationFn:
        async () => {
          /*
            ===================================
            FE-029 CHANGE:
            Rupees -> paise
            ===================================
          */
          const overridePaise =
            Math.round(
              parsedPrice *
                100,
            );

          const response =
            await api.post(
              "/price-overrides",
              {
                dealer_id:
                  dealerId,

                product_id:
                  productId,

                override_price:
                  overridePaise,

                /*
                  ===================================
                  FE-029 CHANGE:
                  Reason / notes
                  ===================================
                */
                reason,

                valid_from:
                  validFrom,

                valid_until:
                  validUntil,
              },
            );

          return response.data;
        },

      /*
        ===================================
        FE-029 CHANGE:
        Refresh pricing
        ===================================
      */
      onSuccess:
        async () => {
          await queryClient.invalidateQueries(
            {
              queryKey: [
                "pricing-preview",
              ],
            },
          );

          setOverridePrice(
            "",
          );

          setReason("");

          onSuccess?.();

          onClose();
        },
    });

  /*
    ===================================
    FE-029 CHANGE:
    Hide for SALES_REP
    ===================================
  */
  if (
    !canOverride ||
    !open
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-xl)]">

        {/* ===================================
            Header
        =================================== */}

        <div className="border-b border-[var(--table-border)] p-6">

          <div className="flex items-start justify-between gap-4">

            <div>
              <h2 className="font-[var(--font-heading)] text-2xl font-semibold text-[var(--text-primary)]">
                Price Override
              </h2>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Create manual
                pricing override
                for this product.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--table-header-bg)]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ===================================
            Body
        =================================== */}

        <div className="space-y-6 p-6">

          {/* ===================================
              Product Info
          =================================== */}

          <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Product */}

              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Product
                </p>

                <h3 className="mt-1 font-semibold text-[var(--text-primary)]">
                  {productName}
                </h3>
              </div>

              {/* Current Price */}

              <div className="rounded-2xl border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-5 py-4">

                <p className="text-xs text-[var(--status-info-text)]">
                  Current Computed
                  Price
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[var(--status-info-text)]">

                  {formatPaise(
                    currentComputedPrice,
                  )}
                </h2>
              </div>
            </div>
          </Card>

          {/* ===================================
              Override Price
          =================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Override */}

            <div>
              <Input
                type="number"
                min={0}

                /*
                  ===================================
                  FE-029 CHANGE:
                  Override in rupees
                  ===================================
                */
                label="Override Price (₹)"

                placeholder="Enter override amount"

                value={
                  overridePrice
                }

                onChange={(
                  e,
                ) =>
                  setOverridePrice(
                    e.target.value,
                  )
                }
              />

              {/* Validation */}

              {isInvalidPrice && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[var(--status-danger-text)]">

                  <ShieldAlert className="h-4 w-4" />

                  <span>
                    Override
                    price must
                    be greater
                    than or
                    equal to 0.
                  </span>
                </div>
              )}
            </div>

            {/* Preview */}

            <div className="rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-5">

              <div className="flex items-center gap-2">

                <BadgeIndianRupee className="h-5 w-5 text-[var(--status-warning-text)]" />

                <p className="font-medium text-[var(--status-warning-text)]">
                  Override Preview
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-bold text-[var(--status-warning-text)]">

                {overridePrice
                  ? `₹${Number(
                      overridePrice,
                    ).toLocaleString(
                      "en-IN",
                    )}`
                  : "₹0"}
              </h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                This override
                replaces computed
                pricing entirely.
              </p>
            </div>
          </div>

          {/* ===================================
              Validity Dates
          =================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Valid From */}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

              <div className="mb-4 flex items-center gap-2">

                <Calendar className="h-4 w-4 text-[var(--navy)]" />

                <h3 className="font-medium text-[var(--text-primary)]">
                  Valid From
                </h3>
              </div>

              <Input
                type="date"
                value={validFrom}
                onChange={(
                  e,
                ) =>
                  setValidFrom(
                    e.target.value,
                  )
                }
              />
            </div>

            {/* Valid Until */}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

              <div className="mb-4 flex items-center gap-2">

                <Calendar className="h-4 w-4 text-[var(--navy)]" />

                <h3 className="font-medium text-[var(--text-primary)]">
                  Valid Until
                </h3>
              </div>

              <Input
                type="date"
                value={validUntil}
                onChange={(
                  e,
                ) =>
                  setValidUntil(
                    e.target.value,
                  )
                }
              />
            </div>
          </div>

          {isInvalidDateRange && (
            <div className="flex items-center gap-2 rounded-xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-4 py-3 text-sm text-[var(--status-danger-text)]">
                <ShieldAlert className="h-4 w-4" />

                <span>
                Valid Until date must be after Valid From date.
                </span>
            </div>
            )}

          {/* ===================================
              Notes
          =================================== */}

          <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

            <Textarea
              label="Reason / Notes"

              placeholder="Enter override reason or approval notes..."

              value={reason}

              onChange={(
                e,
              ) =>
                setReason(
                  e.target.value,
                )
              }
            />
          </Card>

          {/* ===================================
              Footer
          =================================== */}

          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 lg:flex-row lg:items-center lg:justify-between">

            {/* Info */}

            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Override Impact
              </p>

              <p className="mt-1 text-sm text-[var(--text-primary)]">
                Manual override
                replaces computed
                pricing engine
                output.
              </p>
            </div>

            {/* Actions */}

            <div className="flex gap-3">

              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={
                  !overridePrice ||
                  isInvalidPrice ||
                  isInvalidDateRange ||
                  createOverrideMutation.isPending
                }

                onClick={() =>
                  createOverrideMutation.mutate()
                }
              >
                {createOverrideMutation.isPending
                  ? "Saving..."
                  : "Create Override"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
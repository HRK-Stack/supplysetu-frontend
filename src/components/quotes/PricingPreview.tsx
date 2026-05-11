"use client";

/*
  ===================================
  FE-024
  Pricing Preview
  ===================================
*/

import { Card } from "@/components/ui/Card";

import { formatPaise } from "@/lib/money";
import type { PricingSnapshot } from "@/types/pricing";

interface PricingPreviewProps {
  pricing: PricingSnapshot;
}

export default function PricingPreview({
  pricing,
}: PricingPreviewProps) {

  /*
    ===================================
    FE-024 CHANGE:
    Snapshot fields
    ===================================
  */
  const pricingFields = [
    {
      label: "Base Price",
      value:
        pricing.base_price,
    },
    {
      label:
        "Territory Adjustment",
      value:
        pricing.territory_adjustment,
    },
    {
      label:
        "Dealer Discount",
      value:
        pricing.dealer_discount,
    },
    {
      label:
        "Volume Discount",
      value:
        pricing.volume_discount,
    },
    {
      label:
        "Scheme Discount",
      value:
        pricing.scheme_discount,
    },
    {
      label:
        "Override Price",
      value:
        pricing.override_price,
    },
    {
      label:
        "Final Unit Price",
      value:
        pricing.final_unit_price,
    },
    {
      label: "GST Rate",
      value: `${pricing.gst_rate}%`,
      isRate: true,
    },
    {
      label:
        "Final Price With GST",
      value:
        pricing.final_price_with_gst,
    },
  ];

  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
          Pricing Preview
        </h2>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Live pricing engine
          breakdown snapshot.
        </p>
      </div>

      {/* Pricing Grid */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

        {pricingFields.map(
          (field) => (
            <div
              key={field.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4"
            >
              <p className="text-xs text-[var(--text-muted)]">
                {field.label}
              </p>

              <p className="mt-2 font-semibold text-[var(--text-primary)]">
                {field.isRate
                  ? field.value
                  : formatPaise(
                      field.value ||
                        0,
                    )}
              </p>
            </div>
          ),
        )}
      </div>
    </Card>
  );
}
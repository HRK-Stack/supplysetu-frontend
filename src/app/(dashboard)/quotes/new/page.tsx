"use client";

/*
  ===================================
  FE-023
  Quote Create Wizard
  Step 1 - Dealer Selection
  ===================================
*/

import QuoteWizard from "@/components/quotes/QuoteWizard";

export default function NewQuotePage() {
  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div>
        <h1 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--text-primary)]">
          Create Quote
        </h1>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Create dealer
          quotation with
          products, pricing
          and approvals.
        </p>
      </div>

      <QuoteWizard />
    </div>
  );
}
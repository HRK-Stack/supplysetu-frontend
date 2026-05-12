"use client";

/*
  ===================================
  FE-025
  Quote Header
  ===================================
*/

import {
  AlertTriangle,
  Calendar,
  FileText,
  User,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { Quote } from "@/types/quote";

interface QuoteHeaderProps {
  quote: Quote;
}

/*
  ===================================
  FE-025 CHANGE:
  Status badge styles
  ===================================
*/
const statusClasses = {
  DRAFT:
    "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",

  SENT:
    "border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]",

  NEGOTIATION:
    "border border-[var(--status-alert-border)] bg-[var(--status-alert-bg)] text-[var(--status-alert-text)]",

  ACCEPTED:
    "border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]",

  REJECTED:
    "border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]",

  CONVERTED_TO_ORDER:
    "border border-[var(--status-purple-border)] bg-[var(--status-purple-bg)] text-[var(--status-purple-text)]",
};

export default function QuoteHeader({
  quote,
}: QuoteHeaderProps) {

  /*
    ===================================
    FE-025 CHANGE:
    Expiry warning
    ===================================
  */
  const validUntil =
    new Date(
      quote.current_revision
        ?.valid_until ||
        quote.created_at,
    );

  const today =
    new Date();

  const daysRemaining =
    Math.ceil(
      (
        validUntil.getTime() -
        today.getTime()
      ) /
        (1000 *
          60 *
          60 *
          24),
    );

  const isExpiringSoon =
    daysRemaining >= 0 &&
    daysRemaining <= 7;

  const isExpired =
    daysRemaining < 0;

  return (
    <div className="space-y-4">

      {/* ===================================
          Expiry Warning
      =================================== */}

      {(isExpiringSoon ||
        isExpired) && (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--status-warning-text)]" />

          <div>
            <h3 className="font-medium text-[var(--status-warning-text)]">
              {isExpired
                ? "Quote Expired"
                : "Quote Expiring Soon"}
            </h3>

            <p className="mt-1 text-sm text-[var(--status-warning-text)]">
              {isExpired
                ? "This quote has expired."
                : `This quote will expire in ${daysRemaining} day(s).`}
            </p>
          </div>
        </div>
      )}

      {/* ===================================
          Main Header
      =================================== */}

      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          {/* Left */}

          <div className="space-y-5">

            {/* Quote ID */}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--navy)]" />

                <span className="text-sm text-[var(--text-secondary)]">
                  Quote ID
                </span>
              </div>

              <h1 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--text-primary)]">
                {
                  quote.quote_id
                }
              </h1>
            </div>

            {/* Dealer */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Dealer
                </p>

                <p className="mt-1 font-semibold text-[var(--text-primary)]">
                  {
                    quote.dealer_name
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Sales Rep
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--navy)]" />

                  <p className="font-semibold text-[var(--text-primary)]">
                    {
                      quote.sales_rep_name
                    }
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Created Date
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--navy)]" />

                  <p className="font-semibold text-[var(--text-primary)]">
                    {new Date(
                      quote.created_at,
                    ).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}

          <div className="space-y-4">

            {/* Status */}

            <div>
              <p className="mb-2 text-sm text-[var(--text-muted)]">
                Status
              </p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusClasses[
                    quote.status as keyof typeof statusClasses
                  ] ??
                  "border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)]"
                }`}
              >
                {quote.status}
              </span>
            </div>

            {/* Valid Until */}

            <div>
              <p className="mb-2 text-sm text-[var(--text-muted)]">
                Valid Until
              </p>

              <div
                className={`rounded-xl border px-4 py-3 ${
                  isExpiringSoon ||
                  isExpired
                    ? "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]"
                    : "border-[var(--border)] bg-[var(--bg)]"
                }`}
              >
                <p
                  className={`font-medium ${
                    isExpiringSoon ||
                    isExpired
                      ? "text-[var(--status-warning-text)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {validUntil.toLocaleDateString(
                    "en-IN",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
// src/components/quotes/QuoteExpiryBanner.tsx

"use client";

/*
  ===================================
  FE-030
  Quote Expiry Display
  ===================================
*/

import {
  AlertTriangle,
  Clock3,
  RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { formatDate } from "@/lib/format";

interface QuoteExpiryBannerProps {
  validUntil: string;

  onCreateRevision?: () => void;
}

export default function QuoteExpiryBanner({
  validUntil,
  onCreateRevision,
}: QuoteExpiryBannerProps) {

  /*
    ===================================
    FE-030 CHANGE:
    Expiry calculations
    ===================================
  */
  const expiryDate =
    new Date(validUntil);

  const now =
    new Date();

  const diffMs =
    expiryDate.getTime() -
    now.getTime();

  const diffDays =
    Math.ceil(
      diffMs /
        (1000 *
          60 *
          60 *
          24),
    );

  /*
    ===================================
    FE-030 CHANGE:
    Expired state
    ===================================
  */
  const isExpired =
    diffDays < 0;

  /*
    ===================================
    FE-030 CHANGE:
    Expiring soon
    ===================================
  */
  const isExpiringSoon =
    diffDays >= 0 &&
    diffDays <= 7;

  /*
    ===================================
    FE-030 CHANGE:
    Hide if not near expiry
    ===================================
  */
  if (
    !isExpired &&
    !isExpiringSoon
  ) {
    return null;
  }

  return (
    <Card
      className={`rounded-2xl border p-5 shadow-sm ${
        isExpired
          ? "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]"
          : "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]"
      }`}
    >

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* ===================================
            Left
        =================================== */}

        <div className="flex items-start gap-4">

          {/* Icon */}

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isExpired
                ? "bg-[var(--status-danger-border)]"
                : "bg-[var(--status-warning-border)]"
            }`}
          >

            {isExpired ? (
              <AlertTriangle className="h-6 w-6 text-[var(--status-danger-text)]" />
            ) : (
              <Clock3 className="h-6 w-6 text-[var(--status-warning-text)]" />
            )}
          </div>

          {/* Content */}

          <div>

            {/* Title */}

            <h2
              className={`font-[var(--font-heading)] text-xl font-semibold ${
                isExpired
                  ? "text-[var(--status-danger-text)]"
                  : "text-[var(--status-warning-text)]"
              }`}
            >

              {isExpired
                ? "Quote Expired"
                : "Quote Expiring Soon"}
            </h2>

            {/* Message */}

            <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">

              {isExpired ? (
                <>
                  This quote
                  expired on{" "}
                  <span className="font-semibold">
                    {formatDate(
                      validUntil,
                    )}
                  </span>
                  . Accept action
                  is blocked.
                  Create revision
                  to proceed.
                </>
              ) : (
                <>
                  This quote
                  will expire in{" "}
                  <span className="font-semibold">
                    {diffDays}{" "}
                    day
                    {diffDays !==
                    1
                      ? "s"
                      : ""}
                  </span>
                  . Valid until{" "}
                  <span className="font-semibold">
                    {formatDate(
                      validUntil,
                    )}
                  </span>
                  .
                </>
              )}
            </p>

            {/* Countdown */}

            <div className="mt-4 flex flex-wrap items-center gap-3">

              <div className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">

                Valid Until:{" "}
                <span className="font-semibold text-[var(--text-primary)]">

                  {formatDate(
                    validUntil,
                  )}
                </span>
              </div>

              {!isExpired && (
                <div className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">

                  Countdown:{" "}
                  <span className="font-semibold text-[var(--text-primary)]">

                    {diffDays}{" "}
                    day
                    {diffDays !==
                    1
                      ? "s"
                      : ""}{" "}
                    remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================
            Right Actions
        =================================== */}

        <div className="flex items-center gap-3">

          {/* ===================================
              FE-030 CHANGE:
              Create revision CTA
          =================================== */}

          <Button
            type="button"
            disabled={!onCreateRevision}
            onClick={
              onCreateRevision
            }
            className="min-w-[180px]"
          >
            <RefreshCcw className="h-4 w-4" />

            Create Revision
          </Button>
        </div>
      </div>
    </Card>
  );
}
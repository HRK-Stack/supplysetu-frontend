"use client";

/*
  ===================================
  FE-022
  Quote Table
  ===================================
*/

import Link from "next/link";
import type { Quote } from "@/types/quote";

interface QuoteTableProps {
  quotes: Quote[];
}
/*
  ===================================
  FE-022 CHANGE:
  Status badge colors
  ===================================
*/
const statusClasses = {
  DRAFT:
    "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",

  SENT:
    "border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]",

NEGOTIATION:
    "border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]",

  ACCEPTED:
    "border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]",

  REJECTED:
    "border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]",

  CONVERTED_TO_ORDER:
    "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
};

export default function QuoteTable({
  quotes,
}: QuoteTableProps) {

  /*
    ===================================
    FE-022 CHANGE:
    Empty state
    ===================================
  */
  if (quotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] py-16 text-center">
        <h3 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
          No quotes found
        </h3>

        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Try adjusting
          your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">

        {/* ===================================
            Table Header
        =================================== */}

        <thead className="bg-[var(--table-header-bg)]">
          <tr className="border-b border-[var(--table-border)]">
            <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Quote ID
            </th>

            <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Dealer
            </th>

            <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Sales Rep
            </th>

            <th scope="col" className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Status
            </th>

            <th scope="col" className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Created At
            </th>

            <th scope="col" className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Revision Count
            </th>
          </tr>
        </thead>

        {/* ===================================
            Table Body
        =================================== */}

        <tbody>
          {quotes.map(
            (quote) => (
              <tr
                key={quote.id}

                /*
                  FE-022 CHANGE:
                  Click row navigation
                */
                className="cursor-pointer border-b border-[var(--table-border)] transition-colors duration-200 hover:bg-[var(--table-row-hover)]"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="font-medium text-[var(--text-primary)]"
                  >
                    {
                      quote.quote_id
                    }
                  </Link>
                </td>

                <td className="px-5 py-4 text-[var(--text-secondary)]">
                  {
                    quote.dealer_name
                  }
                </td>

                <td className="px-5 py-4 text-[var(--text-secondary)]">
                  {
                    quote.sales_rep_name
                  }
                </td>

                {/* ===================================
                    FE-022 CHANGE:
                    Status badge
                =================================== */}

                <td className="px-5 py-4 text-center">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusClasses[
                        quote.status as keyof typeof statusClasses
                        ] ??
                        "border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)]"
                    }`}
                  >
                    {
                      quote.status
                    }
                  </span>
                </td>

                <td className="px-5 py-4 text-center text-[var(--text-secondary)]">
                  {new Date(
                    quote.created_at,
                  ).toLocaleDateString(
                    "en-IN",
                  )}
                </td>

                <td className="px-5 py-4 text-center">
                  <span className="rounded-lg bg-[var(--table-header-bg)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
                    Rev{" "}
                    {
                      quote.current_revision
                        ?.revision_number ?? 1
                    }
                  </span>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
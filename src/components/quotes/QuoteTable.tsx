"use client";

/*
  ===================================
  FE-022
  Quote Table
  ===================================
*/

import Link from "next/link";
import type { Quote } from "@/types/quote";
import type { Dealer }
  from "@/types/dealer";

import type { User }
  from "@/types/user";

interface QuoteTableProps {
  quotes: Quote[];
  dealers: Dealer[];
  users: User[];
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
  dealers,
  users,
}: QuoteTableProps) {


  const dealerMap =
    Object.fromEntries(
      dealers.map((dealer) => [
        dealer.id,
        dealer.name,
      ]),
    );

  const userMap =
    Object.fromEntries(
      users.map((user) => [
        user.id,
        user.name,
      ]),
    );

  /*
    ===================================
    FE-022 CHANGE:
    Empty state
    ===================================
  */
  if (quotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--border) bg-(--bg) py-16 text-center">
        <h3 className="text-lg font-semibold text-(--text-primary)">
          No quotes found
        </h3>

        <p className="mt-2 text-sm text-(--text-muted)">
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

        <thead className="bg-(--table-header-bg)">
          <tr className="border-b border-(--table-border)">
            <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Quote ID
            </th>

            <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Dealer
            </th>

            <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Sales Rep
            </th>

            <th scope="col" className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Status
            </th>

            <th scope="col" className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Created At
            </th>

            <th scope="col" className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Revision Count
            </th>
          </tr>
        </thead>

        {/* ===================================
            Table Body
        =================================== */}

        <tbody>
          {quotes.map(
            (quote) => {
              console.log("QUOTE:", quote);

              return (
              
              <tr
                key={quote.id}
                onClick={() => {
                  window.location.href =
                    `/quotes/${quote.id}`;
                }}
                className="
                  cursor-pointer
                  border-b border-(--table-border)
                  transition-colors duration-200
                  hover:bg-(--table-row-hover)
                "
              >
                <td className="px-5 py-4">
                  <span className="font-normal text-(--text-primary)">
                    {quote.id.slice(0, 8)}
                  </span>
                </td>

                <td className="px-5 py-4 text-(--text-secondary)">
                  {
                    dealerMap[quote.dealer_id] ?? "-"
                  }
                </td>

                <td className="px-5 py-4 text-(--text-secondary)">
                  {
                    userMap[quote.sales_rep_id] ?? "-"
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
                        "border border-(--border) bg-(--bg) text-(--text-primary)"
                    }`}
                  >
                    {
                      quote.status
                    }
                  </span>
                </td>

                <td className="px-5 py-4 text-center text-(--text-secondary)">
                  {new Date(
                    quote.created_at,
                  ).toLocaleDateString(
                    "en-IN",
                  )}
                </td>

                <td className="px-5 py-4 text-center">
                  <span className="rounded-lg bg-(--table-header-bg) px-3 py-1 text-xs font-semibold text-(--text-primary)">
                    Rev{" "}
                    {
                      quote.current_revision
                        ?.revision_number ?? 1
                    }
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
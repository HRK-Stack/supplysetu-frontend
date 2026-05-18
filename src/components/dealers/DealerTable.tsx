// src/components/dealers/DealerTable.tsx


"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/Badge";

import { formatPaise } from "@/lib/format";

import type { Dealer } from "@/types/dealer";

interface DealerTableProps {
  dealers: Dealer[];
}

export default function DealerTable({
  dealers,
}: DealerTableProps) {
  // ✅ CHANGE:
  // Empty state handling
  // Matches TASK-FE-014 acceptance criteria
  if (dealers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--border) bg-white py-16 text-center">
        <h3 className="text-lg font-semibold text-(--navy)">
          No dealers found
        </h3>

        <p className="mt-2 text-sm text-(--text3)">
          Try changing your filters or
          search query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-(--border) bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-(--border) bg-(--slate-light)">
            <tr>
              <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text3)">
                Name
              </th>

              <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text3)">
                Contact
              </th>

              <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text3)">
                Phone
              </th>

              <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text3)">
                Territory
              </th>

              <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text3)">
                Status
              </th>

              <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text3)">
                Credit Limit
              </th>

              <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text3)">
                Outstanding Balance
              </th>
            </tr>
          </thead>

          <tbody>
            {dealers.map((dealer) => (
              <tr
                key={dealer.id}
                className="border-b border-(--slate-light) transition-colors hover:bg-(--navy-soft)/40"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/dealers/${dealer.id}`}
                    className="block"
                  >
                    <div className="font-medium text-(--navy)">
                      {dealer.name}
                    </div>

                    {dealer.email && (
                      <div className="mt-1 text-xs text-(--text3)">
                        {dealer.email}
                      </div>
                    )}
                  </Link>
                </td>

                <td className="px-5 py-4 text-sm text-(--text2)">
                  {/* ✅ CHANGE:
                      Fallback placeholder for missing values */}
                  {dealer.contact_name || "—"}
                </td>

                <td className="px-5 py-4 text-sm text-(--text2)">
                  {dealer.phone || "—"}
                </td>

                <td className="px-5 py-4 text-sm text-(--text2)">
                  {/* ✅ CHANGE:
                      Optional chaining prevents undefined errors */}
                  {dealer.territory?.name || "—"}
                </td>

                <td className="px-5 py-4">
                  <Badge
                    // ✅ CHANGE:
                    // Status badge mapping
                    // aligned with theme system
                    variant={
                      dealer.status ===
                      "ACTIVE"
                        ? "success"
                        : "warning"
                    }
                  >
                    {dealer.status}
                  </Badge>
                </td>

                <td className="px-5 py-4 text-right font-medium tabular-nums text-(--text)">
                  {/* ✅ CHANGE:
                      Monetary values MUST use formatPaise()
                      per frontend rules */}
                  {formatPaise(
                    dealer.credit_limit,
                  )}
                </td>

                <td className="px-5 py-4 text-right font-medium tabular-nums text-(--text)">
                  {formatPaise(
                    dealer.outstanding_balance,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/Badge";

import { formatPaise } from "@/lib/format";

import type { Dealer } from "@/types/dealer";
import { Territory } from "@/types";

interface DealerTableProps {
  dealers: Dealer[];
  territories: Territory[];
}

export default function DealerTable({
  dealers,
  territories,
}: DealerTableProps) {

  // Create territory lookup map
  const territoryMap = useMemo(() => {
    return territories.reduce(
      (acc, territory) => {
        acc[territory.id] = territory.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [territories]);

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
              <th className="px-5 py-4 text-left">
                Name
              </th>

              <th className="px-5 py-4 text-left">
                Contact
              </th>

              <th className="px-5 py-4 text-left">
                Phone
              </th>

              <th className="px-5 py-4 text-left">
                Territory
              </th>

              <th className="px-5 py-4 text-left">
                Status
              </th>

              <th className="px-5 py-4 text-right">
                Credit Limit
              </th>

              <th className="px-5 py-4 text-right">
                Outstanding Balance
              </th>
            </tr>
          </thead>

          <tbody>
            {dealers.map((dealer) => (
              <tr
                key={dealer.id}
                className="border-b border-(--slate-light)"
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
                  {dealer.contact_name || "—"}
                </td>

                <td className="px-5 py-4 text-sm text-(--text2)">
                  {dealer.phone || "—"}
                </td>

                <td className="px-5 py-4 text-sm text-(--text2)">
                  {
                    dealer.territory_id
                    ? territoryMap[dealer.territory_id] || "—"
                    : "—"
                  }
                </td>

                <td className="px-5 py-4">
                  <Badge
                    variant={
                      dealer.status === "ACTIVE"
                        ? "success"
                        : "warning"
                    }
                  >
                    {dealer.status}
                  </Badge>
                </td>

                <td className="px-5 py-4 text-right">
                  {formatPaise(dealer.credit_limit)}
                </td>

                <td className="px-5 py-4 text-right">
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
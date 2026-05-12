// src/components/territories/TerritoryTable.tsx

"use client";

/*
  ===================================
  FE-036
  Territory Table
  ===================================
*/

import {
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import type { Territory } from "@/types/territory";
import { formatDate } from "@/lib/format";

interface TerritoryTableProps {
  territories: Territory[];

  onEdit: (
    territory: Territory,
  ) => void;
}

export default function TerritoryTable({
  territories,
  onEdit,
}: TerritoryTableProps) {
  /*
    ===================================
    FE-036 CHANGE:
    Format adjustment
    basis points / 100
    ===================================
  */
  const formatAdjustment =
    (
      basisPoints: number,
    ) => {
      const percentage =
        basisPoints / 100;

      const sign =
        percentage > 0
          ? "+"
          : "";

      return `${sign}${percentage.toFixed(
        2,
      )}%`;
    };

  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

      {/* ===================================
          Header
      =================================== */}

      <div className="border-b border-[var(--border)] bg-[var(--table-header-bg)] px-6 py-5">

        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Territories
        </h2>
      </div>

      {/* ===================================
          Table
      =================================== */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-[var(--table-header-bg)]">

            <tr>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Name
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Adjustment %
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Created At
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {territories.map(
              (
                territory,
              ) => (
                <tr
                  key={
                    territory.id
                  }

                  className="border-t border-[var(--border-light)] transition-colors hover:bg-[var(--navy-soft)]"
                >
                  {/* Name */}

                  <td className="px-6 py-4">

                    <p className="font-medium text-[var(--text-primary)]">
                      {
                        territory.name
                      }
                    </p>
                  </td>

                  {/* Adjustment */}

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        territory.adjustment_pct >=
                        0
                          ? "border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                          : "border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]"
                      }`}
                    >
                      {formatAdjustment(
                        territory.adjustment_pct,
                      )}
                    </span>
                  </td>

                  {/* Created */}

                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {formatDate(
                        territory.created_at,
                    )}
                  </td>

                  {/* Actions */}

                  <td className="px-6 py-4 text-right">

                    <Button
                        type="button"
                      size="sm"

                      variant="secondary"

                      onClick={() => {
                        onEdit(
                          territory,
                        );
                      }}
                    >
                      <Pencil className="h-4 w-4" />

                      Edit
                    </Button>
                  </td>
                </tr>
              ),
            )}

            {/* Empty */}

            {territories.length ===
              0 && (
              <tr>

                <td
                  colSpan={4}
                  className="px-6 py-16 text-center"
                >

                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    No Territories
                  </h3>

                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Create your
                    first territory.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
// src/components/schemes/SchemeTable.tsx

"use client";

/*
  ===================================
  FE-037
  Scheme Table
  ===================================
*/

import {
  AlertTriangle,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import type { Scheme } from "@/types/scheme";

import { formatDate } from "@/lib/date";

interface SchemeTableProps {
  schemes: Scheme[];

  page: number;

  totalPages: number;

  onPageChange: (
    page: number,
  ) => void;

  onEdit: (
    scheme: Scheme,
  ) => void;
}

export default function SchemeTable({
  schemes,
  page,
  totalPages,
  onPageChange,
  onEdit,
}: SchemeTableProps) {
  /*
    ===================================
    FE-037 CHANGE:
    Discount formatter
    basis_points / 100
    ===================================
  */
  const formatDiscount =
    (
      basisPoints: number,
    ) => {
      return `${(
        basisPoints / 100
      ).toFixed(2)}%`;
    };

  /*
    ===================================
    FE-037 CHANGE:
    Expiry warning
    ===================================
  */
  const isExpiringSoon =
    (
      endDate: string,
    ) => {
      const now =
        new Date();

      const expiry =
        new Date(
          endDate,
        );

      const diffDays =
        Math.ceil(
          (
            expiry.getTime() -
            now.getTime()
          ) /
            (1000 *
              60 *
              60 *
              24),
        );

      return (
        diffDays <= 7 &&
        diffDays >= 0
      );
    };

  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

      {/* Header */}

      <div className="border-b border-[var(--border)] bg-[var(--table-header-bg)] px-6 py-5">

        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Schemes
        </h2>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-[var(--table-header-bg)]">

            <tr>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Name
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Discount %
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Start Date
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                End Date
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Applies To
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Status
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {schemes.map(
              (
                scheme,
              ) => (
                <tr
                  key={
                    scheme.id
                  }

                  className="border-t border-[var(--border-light)] transition-colors hover:bg-[var(--navy-soft)]"
                >
                  {/* Name */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-2">

                      <p className="font-medium text-[var(--text-primary)]">
                        {
                          scheme.name
                        }
                      </p>

                      {/* ===================================
                          FE-037 CHANGE:
                          Expiry warning
                      =================================== */}

                      {isExpiringSoon(
                        scheme.end_date,
                      ) && (
                        <AlertTriangle className="h-4 w-4 text-[var(--status-warning-text)]" />
                      )}
                    </div>
                  </td>

                  {/* Discount */}

                  <td className="px-6 py-4">

                    <span className="rounded-full bg-[var(--status-success-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-success-text)]">

                      {formatDiscount(
                        scheme.discount_pct,
                      )}
                    </span>
                  </td>

                  {/* Start */}

                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {formatDate(
                      scheme.start_date,
                    )}
                  </td>

                  {/* End */}

                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {formatDate(
                      scheme.end_date,
                    )}
                  </td>

                  {/* Applies To */}

                  <td className="px-6 py-4">

                    <div className="flex flex-wrap gap-2">

                      {(scheme.applies_to?.products
                          ?.length ?? 0) > 0 && (
                          <span className="rounded-full bg-[var(--status-info-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-info-text)]">

                          Products
                        </span>
                      )}

                      {(scheme.applies_to?.territories
                            ?.length ?? 0) > 0 && (
                            <span className="rounded-full bg-[var(--status-warning-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-warning-text)]">

                          Territories
                        </span>
                      )}

                      {scheme
                        .applies_to
                        ?.dealers
                        ?.length >
                        0 && (
                        <span className="rounded-full bg-[var(--status-success-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-success-text)]">

                          Dealers
                        </span>
                      )}

                      {/* ===================================
                          FE-037 CHANGE:
                          Empty arrays apply universally
                      =================================== */}

                      {(scheme.applies_to?.products
                            ?.length ?? 0) === 0 &&
                        (scheme.applies_to?.territories
                            ?.length ?? 0) === 0 &&
                        (scheme.applies_to?.dealers
                            ?.length ?? 0) === 0 && (
                          <span className="rounded-full bg-[var(--table-header-bg)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">

                            Universal
                          </span>
                        )}
                    </div>
                  </td>

                  {/* Status */}

                  <td className="px-6 py-4">

                    {scheme.is_active ? (
                      <span className="rounded-full border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-success-text)]">

                        ACTIVE
                      </span>
                    ) : (
                      <span className="rounded-full border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-danger-text)]">

                        INACTIVE
                      </span>
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
                          scheme,
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

            {schemes.length === 0 && (
                <tr>
                    <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                    >
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        No Schemes Found
                    </h3>

                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Create your first scheme.
                    </p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4">

        <p className="text-sm text-[var(--text-secondary)]">
          Page {page} of{" "}
          {Math.max(totalPages, 1)}
        </p>

        <div className="flex items-center gap-3">

          <Button
            type="button"
            size="sm"

            variant="secondary"

            disabled={
              page <= 1
            }

            onClick={() => {
              onPageChange(
                page - 1,
              );
            }}
          >
            Previous
          </Button>

          <Button
            type="button"
            size="sm"

            disabled={
              page >=
              totalPages
            }

            onClick={() => {
              onPageChange(
                page + 1,
              );
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
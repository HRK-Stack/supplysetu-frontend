// src/components/audit/AuditLogTable.tsx

"use client";

/*
  ===================================
  FE-038
  Audit Log Table
  ===================================
*/

import {
  Fragment,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { formatDate } from "@/lib/date";

import type { AuditLog } from "@/types/audit";

interface AuditLogTableProps {
  logs: AuditLog[];

  page: number;

  totalPages: number;

  onPageChange: (
    page: number,
  ) => void;
}

export default function AuditLogTable({
  logs,
  page,
  totalPages,
  onPageChange,
}: AuditLogTableProps) {
  /*
    ===================================
    FE-038 CHANGE:
    Expand rows
    ===================================
  */
  const [
    expandedRows,
    setExpandedRows,
  ] = useState<
    Record<
      string,
      boolean
    >
  >({});

  /*
    ===================================
    FE-038 CHANGE:
    Toggle row
    ===================================
  */
  const toggleRow = (
    id: string,
  ) => {
    setExpandedRows(
      (
        previous,
      ) => ({
        ...previous,

        [id]:
          !previous[
            id
          ],
      }),
    );
  };

  /*
    ===================================
    FE-038 CHANGE:
    Action badge styles
    ===================================
  */
  const getActionClass =
    (
      action: string,
    ) => {
      switch (
        action
      ) {
        case "CREATE":
          return "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]";

        case "UPDATE":
          return "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]";

        case "DELETE":
          return "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]";

        case "STATUS_CHANGE":
          return "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]";

        case "CREDIT_OVERRIDE":
          return "border-[var(--status-purple-border)] bg-[var(--status-purple-bg)] text-[var(--status-purple-text)]";

        case "EXPORT_STATUS_CHANGE":
          return "border-[var(--status-orange-border)] bg-[var(--status-orange-bg)] text-[var(--status-orange-text)]";

        default:
          return "border-[var(--border)] bg-[var(--table-header-bg)] text-[var(--text-primary)]";
      }
    };

  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

      {/* Header */}

      <div className="border-b border-[var(--border)] bg-[var(--table-header-bg)] px-6 py-5">

        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Audit Entries
        </h2>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-[var(--table-header-bg)]">

            <tr>

              <th className="px-6 py-4" />

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Timestamp
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Actor
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Action
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Entity Type
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Entity ID
              </th>
            </tr>
          </thead>

          <tbody>

            {logs.map(
              (
                log,
              ) => {
                const isExpanded =
                  expandedRows[
                    log.id
                  ];

                return (
                  <Fragment key={log.id}>
                    <tr

                      className="border-t border-[var(--border-light)] transition-colors hover:bg-[var(--navy-soft)]"
                    >
                      {/* Expand */}

                      <td className="px-6 py-4">

                        <button
                          type="button"

                          aria-expanded={
                              isExpanded
                          }

                          aria-label={
                              isExpanded
                              ? "Collapse audit log details"
                              : "Expand audit log details"
                          }
                          onClick={() => {
                            toggleRow(
                              log.id,
                            );
                          }}

                          className="rounded-lg p-1 transition-colors hover:bg-[var(--table-header-bg)]"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                          )}
                        </button>
                      </td>

                      {/* Timestamp */}

                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {formatDate(
                          log.created_at,
                        )}
                      </td>

                      {/* ===================================
                          FE-038 CHANGE:
                          Actor name or fallback
                      =================================== */}

                      <td className="px-6 py-4">

                        <div>

                          <p className="font-medium text-[var(--text-primary)]">
                            {log.actor_name ??
                              log.actor_user_id}
                          </p>

                          <p className="text-xs text-[var(--text-secondary)]">
                            {
                              log.actor_user_id
                            }
                          </p>
                        </div>
                      </td>

                      {/* Action */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getActionClass(
                            log.action,
                          )}`}
                        >
                          {
                            log.action
                          }
                        </span>
                      </td>

                      {/* Entity Type */}

                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                        {
                          log.entity_type
                        }
                      </td>

                      {/* Entity ID */}

                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {
                          log.entity_id
                        }
                      </td>
                    </tr>

                    {/* ===================================
                        FE-038 CHANGE:
                        Expandable diff view
                    =================================== */}

                    {isExpanded && (
                      <tr className="border-t border-[var(--border-light)] bg-[var(--bg)]">

                        <td
                          colSpan={6}
                          className="px-6 py-6"
                        >

                          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                            {/* Old Value */}

                            <div className="rounded-2xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] p-5">

                              <h3 className="mb-4 text-sm font-semibold text-[var(--status-danger-text)]">
                                Old Value
                              </h3>

                              {/* ===================================
                                  FE-038 CHANGE:
                                  Readable diff
                              =================================== */}

                              <div className="space-y-3">

                                {Object.keys(
                                    log.old_value ??
                                    {},
                                ).length === 0 && (
                                    <p className="text-sm text-[var(--text-secondary)]">
                                    No previous values
                                    </p>
                                )}

                                {Object.entries(
                                    log.old_value ??
                                    {},
                                ).map(
                                    ([
                                    key,
                                    value,
                                    ]) => (
                                    <div
                                        key={key}
                                        className="rounded-xl bg-white/40 p-3"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--status-danger-text)]">
                                        {key}
                                        </p>

                                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-sm text-[var(--text-primary)]">
                                        {typeof value ===
                                        "object"
                                            ? JSON.stringify(
                                                value,
                                                null,
                                                2,
                                            )
                                            : String(
                                                value,
                                            )}
                                        </pre>
                                    </div>
                                    ),
                                )}
                                </div>

                            {/* New Value */}

                            <div className="rounded-2xl border border-[var(--status-success-border)] bg-[var(--status-success-bg)] p-5">

                              <h3 className="mb-4 text-sm font-semibold text-[var(--status-success-text)]">
                                New Value
                              </h3>

                              <div className="space-y-3">

                                {Object.keys(
                                    log.new_value ??
                                    {},
                                ).length === 0 && (
                                    <p className="text-sm text-[var(--text-secondary)]">
                                    No updated values
                                    </p>
                                )}

                                {Object.entries(
                                    log.new_value ??
                                    {},
                                ).map(
                                    ([
                                    key,
                                    value,
                                    ]) => (
                                    <div
                                        key={key}
                                        className="rounded-xl bg-white/40 p-3"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--status-success-text)]">
                                        {key}
                                        </p>

                                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-sm text-[var(--text-primary)]">
                                        {typeof value ===
                                        "object"
                                            ? JSON.stringify(
                                                value,
                                                null,
                                                2,
                                            )
                                            : String(
                                                value,
                                            )}
                                        </pre>
                                    </div>
                                    ),
                                )}
                                </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4">

        <p className="text-sm text-[var(--text-secondary)]">
          Page {page} of{" "}
          {Math.max(
            totalPages,
            1,
          )}
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
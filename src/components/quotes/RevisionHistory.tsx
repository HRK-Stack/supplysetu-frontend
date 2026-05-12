"use client";

/*
  ===================================
  FE-025
  Revision History
  ===================================
*/

import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";

import type {
  QuoteRevision,
  QuoteItem,
} from "@/types/quote";

import { formatPaise } from "@/lib/format";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";

interface RevisionHistoryProps {
  quoteId: string;
}

export default function RevisionHistory({
  quoteId,
}: RevisionHistoryProps) {

  /*
    ===================================
    FE-025 CHANGE:
    Expanded revision
    ===================================
  */
  const [
    expandedRevision,
    setExpandedRevision,
  ] = useState<
    string | null
  >(null);

  /*
    ===================================
    FE-025 CHANGE:
    Fetch revisions
    ===================================
  */
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: [
      "quote-revisions",
      quoteId,
    ],

    queryFn: async () => {
      const response =
        await api.get<{
            data: QuoteRevision[];
        }>(
          `/quotes/${quoteId}/revisions`,
        );

      return response.data;
    },
  });

  const revisions =
    data?.data ?? [];

  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">

      {/* ===================================
          Header
      =================================== */}

      <div className="border-b border-[var(--table-border)] px-6 py-5">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-[var(--navy)]" />

          <div>
            <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
              Revision History
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Historical quote
              revisions and
              notes.
            </p>
          </div>
        </div>
      </div>

      {/* ===================================
          Loading
      =================================== */}

      {isLoading && (
        <div className="space-y-4 p-6">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-[var(--table-header-bg)]"
              />
            ),
          )}
        </div>
      )}

      {/* ===================================
          Empty
      =================================== */}

      {!isLoading &&
        revisions.length ===
          0 && (
          <div className="py-14 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No revision
              history found.
            </p>
          </div>
        )}

      {/* ===================================
          Revision List
      =================================== */}

      {!isLoading &&
        revisions.length >
          0 && (
          <div className="divide-y divide-[var(--table-border)]">

            {revisions.map(
              (
                revision: QuoteRevision,
              ) => {
                const expanded =
                  expandedRevision ===
                  revision.id;

                return (
                  <div
                    key={
                      revision.id
                    }
                    className="p-6"
                  >

                    {/* Revision Row */}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRevision(
                          expanded
                            ? null
                            : revision.id,
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-[var(--table-header-bg)] px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                            Revision{" "}
                            {
                              revision.revision_number
                            }
                          </span>

                          <p className="text-sm text-[var(--text-secondary)]">
                            {new Date(
                              revision.created_at,
                            ).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>

                        {revision.notes && (
                          <p className="mt-3 text-sm text-[var(--text-primary)]">
                            {
                              revision.notes
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        {expanded ? (
                          <ChevronUp className="h-5 w-5 text-[var(--text-secondary)]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[var(--text-secondary)]" />
                        )}
                      </div>
                    </button>

                    {/* ===================================
                        FE-025 CHANGE:
                        Revision Items
                        Read-only
                    =================================== */}

                    {expanded && (
                      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
                        <div className="space-y-4">

                          {revision.items?.map(
                            (
                              item: QuoteItem,
                            ) => (
                              <div
                                key={
                                  item.id
                                }
                                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                              >
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                                  <div>
                                    <h4 className="font-medium text-[var(--text-primary)]">
                                      {item.product_id}
                                    </h4>

                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="rounded-lg bg-[var(--table-header-bg)] px-2 py-1 font-mono text-xs text-[var(--text-primary)]">
                                        HSN{" "}
                                        {
                                          item.pricing_snapshot
                                            .hsn_code
                                        }
                                      </span>

                                      <span className="text-xs text-[var(--text-secondary)]">
                                        Qty{" "}
                                        {
                                          item.quantity
                                        }
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-sm text-[var(--text-muted)]">
                                      Final Price
                                    </p>

                                    <p className="mt-1 font-semibold text-[var(--navy)]">
                                      {formatPaise(
                                        item.pricing_snapshot
                                          .final_price_with_gst,
                                    )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}
    </Card>
  );
}
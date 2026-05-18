"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { useDealer } from "@/hooks/useDealers";
import { useAuth } from "@/hooks/useAuth";

import { formatPaise } from "@/lib/format";

import DealerInfoPanel from "@/components/dealers/DealerInfoPanel";
import DealerAddressList from "@/components/dealers/DealerAddressList";

export default function DealerDetailPage() {
  const params = useParams();

  // ✅ CHANGE:
  // safer App Router param handling
  // useParams() can return string | string[]
  const dealerId =
    typeof params.id === "string"
      ? params.id
      : "";

  const { role } = useAuth();

  const {
    data,
    isLoading,
    error,
  } = useDealer(dealerId);

  const dealer = data ?? null;

  const canEdit =
    role === "ADMIN" ||
    role === "MANAGER";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-(--bg-card)" />

        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="h-5 w-full animate-pulse rounded bg-(--bg-main)"
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-red-500">
            Failed to load dealer
          </h2>

          <p className="text-sm text-(--text-secondary)">
            Unable to fetch dealer
            details.
          </p>

          {/* ✅ CHANGE:
              kept Link wrapper pattern
              used consistently across project */}
          <Link href="/dealers">
            <Button variant="secondary">
              Back to Dealers
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            href="/dealers"
            className="inline-flex items-center gap-2 text-sm text-(--text-secondary) transition hover:text-(--text-primary)"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dealers
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-(--text-primary)">
              {dealer.name}
            </h1>

            <p className="mt-1 text-sm text-(--text-secondary)">
              Dealer Details &
              Address Information
            </p>
          </div>
        </div>

        {canEdit && (
          <Link
            href={`/dealers/${dealer.id}/edit`}
          >
            <Button className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Dealer
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Credit Limit */}
        <Card className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
          {/* ✅ CHANGE:
              standardized variable names
              from --border-color → --border */}
          <p className="text-sm text-(--text-secondary)">
            Credit Limit
          </p>

          <h3 className="mt-2 text-2xl font-bold text-(--text-primary)">
            {/* ✅ CHANGE:
                safer nullable fallback */}
            {formatPaise(
              dealer.credit_limit ?? 0,
            )}
          </h3>
        </Card>

        {/* Outstanding Balance */}
        <Card className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
          <p className="text-sm text-(--text-secondary)">
            Outstanding Balance
          </p>

          <h3 className="mt-2 text-2xl font-bold text-red-500">
            {formatPaise(
              dealer.outstanding_balance ??
                0,
            )}
          </h3>

          <p className="mt-1 text-xs text-(--text-secondary)">
            Read-only field
          </p>
        </Card>

        {/* Dealer Discount */}
        <Card className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
          <p className="text-sm text-(--text-secondary)">
            Dealer Discount
          </p>

          <h3 className="mt-2 text-2xl font-bold text-(--text-primary)">
            {/* ✅ CHANGE:
                removed /100
                because backend percentage storage
                is not confirmed as basis points */}
            {(
              dealer.discount_pct ?? 0
            ).toFixed(2)}
            %
          </h3>
        </Card>
      </div>

      {/* Dealer Information */}
      <DealerInfoPanel dealer={dealer} />

      {/* Dealer Addresses */}
      <DealerAddressList
        dealerId={dealer.id}
      />
    </div>
  );
}
// src/app/(dashboard)/dealers/[id]/edit/page.tsx

"use client";

import { useParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import DealerForm from "@/components/dealers/DealerForm";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { useAuth } from "@/hooks/useAuth";
import { useDealer } from "@/hooks/useDealers";
import Link from "next/link";

export default function EditDealerPage() {
  const params = useParams();

  const dealerId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { role } = useAuth();

  const isForbidden =
    role ==="SALES_REP";

  const {
    data,
    isLoading,
    error,
  } = useDealer(dealerId ?? "");


  const dealer = data ?? null;

  if (isForbidden) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border border-red-500/20 bg-(--bg-card) p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <ShieldAlert className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-(--text-primary)">
            Access Denied
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
            You do not have
            permission to edit
            dealers.
          </p>

          <Link href="/dealers" className="w-full">
            <Button className="mt-6 w-full">
              Back to Dealers
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-(--bg-main)" />

        <Card className="rounded-2xl p-6">
          <div className="space-y-4">
            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-xl bg-(--bg-main)"
                />
              ),
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <Card className="rounded-2xl p-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-red-500">
            Failed to load
            dealer
          </h2>

          <p className="text-sm text-(--text-secondary)">
            Unable to fetch
            dealer data.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-(--text-primary)">
          Edit Dealer
        </h1>

        <p className="mt-1 text-sm text-(--text-secondary)">
          Update dealer
          information and
          territory mapping.
        </p>
      </div>

      <DealerForm
        mode="edit"
        dealerId={dealer.id}
        initialData={{
          id: dealer.id,

          version:
            dealer.version,

          name: dealer.name,

          contact_name:
            dealer.contact_name,

          phone: dealer.phone,

          email: dealer.email,

          gstin: dealer.gstin,

          address:
            dealer.address,

          territory_id:
            dealer.territory_id,

          discount_pct:
            dealer.discount_pct / 100,

          credit_limit:
            dealer.credit_limit / 100,
        }}
      />
    </div>
  );
}
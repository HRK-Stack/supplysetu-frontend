// src/app/(dashboard)/quotes/[id]/page.tsx

"use client";

/*
  ===================================
  FE-025 + FE-027 + FE-028 + FE-030 + FE-031
  Quote Detail Page
  ===================================
*/

import {
  useParams,
} from "next/navigation";

import {
  useQuery,
} from "@tanstack/react-query";

import type { Dealer }
  from "@/types/dealer";

import type { User }
  from "@/types/user";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";

import QuoteHeader from "@/components/quotes/QuoteHeader";

/*
  ===================================
  FE-027 CHANGE:
  Added quote actions
  ===================================
*/
import QuoteActions from "@/components/quotes/QuoteActions";

/*
  ===================================
  FE-028 CHANGE:
  Added revision creator
  ===================================
*/
import RevisionCreator from "@/components/quotes/RevisionCreator";

/*
  ===================================
  FE-030 CHANGE:
  Added expiry banner
  ===================================
*/
import QuoteExpiryBanner from "@/components/quotes/QuoteExpiryBanner";

/*
  ===================================
  FE-031 CHANGE:
  Added order converter
  ===================================
*/

import QuoteItemList from "@/components/quotes/QuoteItemList";
import RevisionHistory from "@/components/quotes/RevisionHistory";

import type { Quote } from "@/types/quote";

export default function QuoteDetailPage() {
  const params = useParams();

  const quoteId =
    typeof params?.id ===
    "string"
      ? params.id
      : "";

  /*
    ===================================
    FE-025 CHANGE:
    Fetch quote details
    ===================================
  */

  /*
    ===================================
    FE-027 CHANGE:
    Added refetch
    for status transition refresh
    ===================================
  */
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<{
    data: Quote;
  }>({
    enabled:
      Boolean(quoteId),

    queryKey: [
      "quote-detail",
      quoteId,
    ],

    queryFn: async () => {
      const response =
        await api.get<{
          data: Quote;
        }>(
          `/quotes/${quoteId}`,
        );

      return response.data;
    },
  });
  const {
    data: dealersData,
  } = useQuery({
    queryKey: ["dealers"],

    queryFn: async () => {
      const response =
        await api.get("/dealers");

      return response.data;
    },
  });

  const {
    data: usersData,
  } = useQuery({
    queryKey: ["users"],

    queryFn: async () => {
      const response =
        await api.get("/users");

      return response.data;
    },
  });

  const {
    data: productsData,
  } = useQuery({
    queryKey: ["products"],

    queryFn: async () => {
      const response =
        await api.get("/products");

      return response.data;
    },
  });

  const quote =
    data?.data;
  
  const dealers: Dealer[] =
    dealersData?.data ?? [];

  const users: User[] =
    usersData?.data ?? [];

  const products =
    productsData?.data ?? [];


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

  const productMap =
    Object.fromEntries(
      products.map((product: any) => [
        product.id,
        product.name,
      ]),
    );

  /*
    ===================================
    Loading State
    ===================================
  */
  if (isLoading) {
    return (
      <div className="space-y-6">

        <div className="h-32 animate-pulse rounded-2xl bg-(--table-header-bg)" />

        <div className="h-96 animate-pulse rounded-2xl bg-(--table-header-bg)" />
      </div>
    );
  }

  /*
    ===================================
    Error State
    ===================================
  */
  if (error || !quote) {
    return (
      <Card className="rounded-2xl border border-(--status-danger-border) bg-(--card) p-6">

        <h2 className="text-xl font-semibold text-(--status-danger-text)">
          Failed to load
          quote
        </h2>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Unable to fetch
          quote details.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================
          Quote Header
      =================================== */}

      <QuoteHeader
        quote={quote}
        dealerName={
          dealerMap[
            quote.dealer_id
          ] ?? "-"
        }

        salesRepName={
          userMap[
            quote.sales_rep_id
          ] ?? "-"
        }
      />

      {/* ===================================
          FE-030 CHANGE:
          Quote Expiry Banner
      =================================== */}

      {quote.current_revision?.valid_until && (
        <QuoteExpiryBanner
          validUntil={
            quote.current_revision?.valid_until
          }

          /*
            ===================================
            FE-030 CHANGE:
            Open revision flow
            ===================================
          */
          onCreateRevision={() => {
            const revisionButton =
              document.querySelector(
                "[data-create-revision]",
              ) as HTMLButtonElement | null;

            revisionButton?.click();
          }}
        />
      )}

      {/* ===================================
          FE-027 CHANGE:
          Quote Status Actions
      =================================== */}

      <QuoteActions
        quote={quote}

        /*
          ===================================
          FE-027 CHANGE:
          Refetch latest quote
          after transition
          ===================================
        */
        onRefresh={() => {
          void refetch();
        }}
      />

      {/* ===================================
          FE-031 CHANGE:
          Quote To Order Conversion
      =================================== */}

      {/* ===================================
          FE-028 CHANGE:
          Quote Revision Creator
      =================================== */}

      <RevisionCreator
        quote={quote}

        /*
          ===================================
          FE-028 CHANGE:
          Refetch latest quote
          + revisions after create
          ===================================
        */
        onSuccess={() => {
          void refetch();
        }}
      />

      {/* ===================================
          Current Revision
      =================================== */}

      <QuoteItemList
        items={
          quote.current_revision
            ?.items ?? []
        }
        productMap={productMap}
      />

      {/* ===================================
          Revision History
      =================================== */}

      <RevisionHistory
        quoteId={quote.id}
      />
    </div>
  );
}
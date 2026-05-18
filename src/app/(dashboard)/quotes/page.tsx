"use client";

/*
  ===================================
  FE-022
  Quote List Page
  ===================================
*/

import { useMemo, useState } from "react";

import Link from "next/link";

import { Plus } from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

import QuoteTable from "@/components/quotes/QuoteTable";
import QuoteFilters from "@/components/quotes/QuoteFilters";

import { useAuth } from "@/hooks/useAuth";
import type { Quote } from "@/types/quote";
import type { PaginatedResponse } from "@/types/common";

export default function QuotesPage() {
  const {
    role,
    isLoading: authLoading,
    } = useAuth();



  /*
    ===================================
    FE-022 CHANGE:
    Filters + pagination state
    ===================================
  */
  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(20);

  const [status, setStatus] =
    useState("");

  const [dealerId, setDealerId] =
    useState("");

  const [
    salesRepId,
    setSalesRepId,
  ] = useState("");

  const [
    createdFrom,
    setCreatedFrom,
  ] = useState("");

  const [
    createdTo,
    setCreatedTo,
  ] = useState("");

  /*
    ===================================
    FE-022 CHANGE:
    Query builder
    ===================================
  */
  const queryParams =
    useMemo(() => {
      const params =
        new URLSearchParams();

      params.set(
        "page",
        String(page),
      );

      params.set(
        "page_size",
        String(pageSize),
      );

      params.set(
        "sort_by",
        "created_at",
      );

      params.set(
        "sort_order",
        "desc",
      );

      if (status) {
        params.set(
          "status",
          status,
        );
      }

      if (dealerId) {
        params.set(
          "dealer_id",
          dealerId,
        );
      }

      /*
        ===================================
        FE-022 CHANGE:
        ADMIN/MANAGER only
        ===================================
      */
      if (
        salesRepId &&
        role !==
          "SALES_REP"
      ) {
        params.set(
          "sales_rep_id",
          salesRepId,
        );
      }

      if (createdFrom) {
        params.set(
          "created_at_from",
          createdFrom,
        );
      }

      if (createdTo) {
        params.set(
          "created_at_to",
          createdTo,
        );
      }

      return params.toString();
    }, [
      page,
      pageSize,
      status,
      dealerId,
      salesRepId,
      createdFrom,
      createdTo,
      role,
    ]);

  /*
    ===================================
    FE-022 CHANGE:
    React Query fetching
    ===================================
  */
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
        "quotes",
        page,
        pageSize,
        status,
        dealerId,
        salesRepId,
        createdFrom,
        createdTo,
        role,
    ],

    queryFn: async () => {
      const response =
        await api.get<
            PaginatedResponse<Quote>
        >(
            `/quotes?${queryParams}`,
        );

      return response.data;
    },
  });

  const quotes =
    data?.data ?? [];

  /*
    ===================================
    FE-022 CHANGE:
    Pagination meta
    ===================================
  */
  const meta =
    data?.success
      ? data.meta
      : null;
    
  if (authLoading) {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-(--text-primary)">
            Quotes
          </h1>

          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage dealer
            quotations and
            negotiations.
          </p>
        </div>

        {/* 
          FE-022 CHANGE:
          Create Quote visible
          to all roles
        */}
        <Link href="/quotes/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Quote
          </Button>
        </Link>
      </div>

      {/* ===================================
          Filters
      =================================== */}

      <QuoteFilters
        status={status}
        onStatusChange={(
          value,
        ) => {
          setPage(1);

          setStatus(value);
        }}
        dealerId={dealerId}
        onDealerChange={(
          value,
        ) => {
          setPage(1);

          setDealerId(value);
        }}
        salesRepId={
          salesRepId
        }
        onSalesRepChange={(
          value,
        ) => {
          setPage(1);

          setSalesRepId(
            value,
          );
        }}
        createdFrom={
          createdFrom
        }
        onCreatedFromChange={(
          value,
        ) => {
          setPage(1);

          setCreatedFrom(
            value,
          );
        }}
        createdTo={
          createdTo
        }
        onCreatedToChange={(
          value,
        ) => {
          setPage(1);

          setCreatedTo(
            value,
          );
        }}
        canViewSalesRepFilter={
          role !==
          "SALES_REP"
        }
      />

      {/* ===================================
          Quote Table
      =================================== */}

      <Card className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm">

        {/* 
          FE-022 CHANGE:
          Skeleton loading
        */}
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-xl bg-(--table-header-bg)"
                />
              ),
            )}
          </div>
        ) : error ? (

          /* 
            FE-022 CHANGE:
            Error state
          */
          <div className="p-6">
            <div className="rounded-2xl border border-(--status-danger-border) bg-(--status-danger-bg) p-4">
              <p className="text-sm text-(--status-danger-text)">
                Failed to load
                quotes.
              </p>
            </div>
          </div>
        ) : quotes.length === 0 ? (
            <div className="p-12 text-center">
            <p className="text-sm text-(--text-muted)">
                No quotes found.
            </p>
            </div>
        ) : (
            <QuoteTable
            quotes={quotes}
            />
        )}
      </Card>

      {/* ===================================
          Pagination
      =================================== */}

      {meta && (
        <Pagination
          meta={meta}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPage(1);
            setPageSize(size);
          }}
        />
      )}
    </div>
  );
}
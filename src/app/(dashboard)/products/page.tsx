"use client";

/*
  ===================================
  FE-019
  Products Listing Page
  ===================================
*/

import { useMemo, useState } from "react";

import { Plus } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

import ProductTable from "@/components/products/ProductTable";
import ProductFilters from "@/components/products/ProductFilters";

import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types/product";
import type { PaginatedResponse } from "@/types/common";

export default function ProductsPage() {
  const { user } = useAuth();

  /*
    ===================================
    FE-019 CHANGE:
    Filters + pagination state
    ===================================
  */
  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(20);

  const [search, setSearch] =
    useState("");

  const [gstRate, setGstRate] =
    useState("");

  /*
    ===================================
    FE-019 CHANGE:
    Query params builder
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

      if (search.trim()) {
        params.set(
          "search",
          search.trim(),
        );
      }

      if (gstRate) {
        params.set(
          "gst_rate",
          gstRate,
        );
      }

      return params.toString();
    }, [
      page,
      pageSize,
      search,
      gstRate,
    ]);

  /*
    ===================================
    FE-019 CHANGE:
    React Query data fetching
    NO useEffect
    ===================================
  */
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "products",
      queryParams,
    ],

    queryFn: async () => {
      const response =
        await api.get<
            PaginatedResponse<Product>
        >(
            `/products?${queryParams}`,
        );

      return response.data;
    },
  });

  const products =
    data?.data ?? [];

  /*
    ===================================
    FE-019 CHANGE:
    Pagination from response.meta
    ===================================
  */
  const meta =
    data?.meta;

  const canCreate =
    user?.role ===
      "ADMIN" ||
    user?.role ===
      "MANAGER";

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--text-primary)]">
            Products
          </h1>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage product
            catalog and pricing.
          </p>
        </div>

        {/* 
          FE-019 CHANGE:
          ADMIN/MANAGER only
        */}
        {canCreate && (
            <Button href="/products/new">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
        )}
      </div>

      {/* ===================================
          Filters
      =================================== */}

      <ProductFilters
        search={search}
        onSearchChange={(
          value,
        ) => {
          setPage(1);

          setSearch(value);
        }}
        gstRate={gstRate}
        onGstRateChange={(
          value,
        ) => {
          setPage(1);

          setGstRate(value);
        }}
      />

      {/* ===================================
          Table
      =================================== */}

      <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">

        {/* 
          FE-019 CHANGE:
          Skeleton loader
        */}
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-xl bg-[var(--table-header-bg)]"
                />
              ),
            )}
          </div>
        ) : error ? (

          /* 
            FE-019 CHANGE:
            Error state
          */
          <div className="p-6">
            <div className="rounded-2xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] p-4">
              <p className="text-sm text-[var(--status-danger-text)]">
                Failed to load products.
              </p>
            </div>
          </div>
        ) : (
          products.length === 0 ? (
            <div className="p-12 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                No products found.
                </p>
            </div>
            ) : (
            <ProductTable
                products={products}
            />
            )
        )}
      </Card>

      {/* ===================================
          Pagination
      =================================== */}

      {meta && (
        <Pagination
          page={meta.page}
          pageSize={
            meta.page_size
          }
          total={meta.total}
          totalPages={
            meta.total_pages
          }
          onPageChange={
            setPage
          }
          onPageSizeChange={(
            size,
          ) => {
            setPage(1);

            setPageSize(
              size,
            );
          }}
        />
      )}
    </div>
  );
}
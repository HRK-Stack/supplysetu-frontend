"use client";

/*
  ===================================
  FE-024
  Product Search
  ===================================
*/

import { useState } from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  PackageSearch,
} from "lucide-react";

import api from "@/lib/api";

import { Input } from "@/components/ui/Input";
import type { Product } from "@/types/product";

interface ProductSearchProps {
  selectedProductId:
    | string
    | null;

  onSelect: (
    product: Product,
  ) => void;
}

export default function ProductSearch({
  selectedProductId,
  onSelect,
}: ProductSearchProps) {

  /*
    ===================================
    FE-024 CHANGE:
    Search state
    ===================================
  */
  const [search, setSearch] =
    useState("");

  /*
    ===================================
    FE-024 CHANGE:
    ACTIVE products only
    ===================================
  */
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: [
      "active-products",
      search,
    ],

    queryFn: async () => {
      const response =
        await api.get<{
            data: Product[];
        }>(
            `/products?status=ACTIVE&search=${search}&page=1&page_size=50`,
        );

      return response.data;
    },
  });

  const products: Product[] =
    data?.data ?? [];

  return (
    <div className="space-y-4">

      {/* Search */}

      <div className="relative">
        <PackageSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />

        <Input
          placeholder="Search products"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value,
            )
          }
          className="pl-11"
        />
      </div>

      {/* Product List */}

      <div className="max-h-[320px] space-y-3 overflow-y-auto">

        {/* Loading */}

        {isLoading &&
          Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl bg-[var(--table-header-bg)]"
              />
            ),
          )}

        {/* Empty */}

        {!isLoading &&
          products.length ===
            0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] py-10 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                No products
                found.
              </p>
            </div>
          )}

        {/* Products */}

        {products.map(
          (product: Product) => {
            const isSelected =
              product.id ===
              selectedProductId;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() =>
                  onSelect(
                    product,
                  )
                }
                className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[var(--navy)] bg-[var(--table-header-bg)] shadow-md"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--navy-soft)]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {
                        product.name
                      }
                    </h3>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-lg bg-[var(--table-header-bg)] px-2 py-1 font-mono text-xs text-[var(--text-primary)]">
                        {
                          product.hsn_code
                        }
                      </span>

                      <span className="text-xs text-[var(--text-secondary)]">
                        SKU:{" "}
                        {
                          product.sku
                        }
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-[var(--text-muted)]">
                      GST
                    </p>

                    <span className="rounded-full border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-2 py-1 text-xs font-medium text-[var(--status-info-text)]">
                      {
                        product.gst_rate
                      }
                      %
                    </span>
                  </div>
                </div>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}
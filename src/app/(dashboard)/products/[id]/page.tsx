"use client";

/*
  ===================================
  FE-020
  Product Detail Page
  ===================================
*/

import Link from "next/link";

import {
  ArrowLeft,
  Pencil,
} from "lucide-react";

import { useParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { useAuth } from "@/hooks/useAuth";

import ProductInfoPanel from "@/components/products/ProductInfoPanel";

import { formatPaise } from "@/lib/format";
import type { Product } from "@/types/product";
import type { VolumeDiscountSlab } from "@/types/product";
import type { PaginatedResponse } from "@/types/common";

export default function ProductDetailPage() {
  const params = useParams();

  const productId =
    Array.isArray(params.id)
        ? params.id[0]
        : params.id;

  const { role } = useAuth();

  /*
    ===================================
    FE-020 CHANGE:
    Fetch product details
    ===================================
  */
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "product",
      productId,
    ],

    queryFn: async () => {
        const response =
            await api.get<{
            data: Product;
            }>(
            `/products/${productId}`,
            );

        return response.data;
    },
  });

  /*
    ===================================
    FE-020 CHANGE:
    Volume discount slabs
    ===================================
  */
  const {
    data: slabData,
    isLoading:
      slabsLoading,
    error: slabsError,
  } = useQuery({
    queryKey: [
      "volume-discount-slabs",
      productId,
    ],

    queryFn: async () => {
      const response =
        await api.get<
            PaginatedResponse<
                VolumeDiscountSlab
            >
        >(
            `/volume-discount-slabs?product_id=${productId}`,
        );

      return response.data;
    },
  });

  const product =
    data?.data;

  const slabs =
    slabData?.data ?? [];

  const canEdit =
    role ===
      "ADMIN" ||
    role ===
      "MANAGER";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-(--table-header-bg)" />

        <Card className="rounded-2xl border border-(--border) bg-(--card) p-6">
          <div className="space-y-4">
            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-5 animate-pulse rounded bg-(--table-header-bg)"
                />
              ),
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card className="rounded-2xl border border-(--border) bg-(--card) p-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-(--status-danger-text)">
            Failed to load
            product
          </h2>

          <p className="text-sm text-(--text-secondary)">
            Unable to fetch
            product details.
          </p>
            <Link href="/products">
              <Button variant="secondary">
                Back to Products
              </Button>
            </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary)"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div>
            <h1 className="font-(--font-heading) text-3xl text-(--text-primary)">
              {product.name}
            </h1>

            <p className="mt-1 text-sm text-(--text-secondary)">
              Product details,
              pricing, GST and
              discount slabs.
            </p>
          </div>
        </div>

        {/* 
          FE-020 CHANGE:
          ADMIN/MANAGER only
        */}
        {canEdit && (
            <Link href={`/products/${product.id}/edit`}>
              <Button>
                <Pencil className="h-4 w-4" />
                Edit Product
              </Button>
            </Link>
        )}
      </div>

      {/* ===================================
          Product Info
      =================================== */}

      <ProductInfoPanel
        product={product}
      />

      {/* ===================================
          FE-020 CHANGE:
          Volume Discount Slabs
      =================================== */}

      <Card className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm">
        <div className="border-b border-(--table-border) px-6 py-5">
          <h2 className="text-xl font-semibold text-(--text-primary)">
            Volume Discount
            Slabs
          </h2>

          <p className="mt-1 text-sm text-(--text-muted)">
            Quantity-based
            pricing rules for
            bulk orders.
          </p>
        </div>

        {slabsLoading ? (

          /*
            FE-020 CHANGE:
            Slabs skeleton
          */
          <div className="space-y-4 p-6">
            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-xl bg-(--table-header-bg)"
                />
              ),
            )}
          </div>
        ) : slabsError ? (
            <div className="p-6">
                <div className="rounded-2xl border border-(--status-danger-border) bg-(--status-danger-bg) p-4">
                    <p className="text-sm text-(--status-danger-text)">
                        Failed to load
                        discount slabs.
                    </p>
                </div>
            </div>
        ) : slabs.length === 0 ? (
          /*
            FE-020 CHANGE:
            Empty slabs state
          */
          <div className="py-14 text-center">
            <p className="text-sm text-(--text-muted)">
              No volume
              discount slabs
              configured.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">

              {/* ===================================
                  Table Header
              =================================== */}

              <thead className="bg-(--table-header-bg)">
                <tr className="border-b border-(--table-border)">
                  <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Min Qty
                  </th>

                  <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Max Qty
                  </th>

                  <th scope="col" className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Discount %
                  </th>

                  <th scope="col" className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Price Override
                  </th>
                </tr>
              </thead>

              {/* ===================================
                  Table Body
              =================================== */}

              <tbody>
                {slabs.map(
                  (
                    slab: VolumeDiscountSlab,
                  ) => (
                    <tr
                      key={slab.id}
                      className="border-b border-(--table-border)"
                    >
                      <td className="px-5 py-4 text-(--text-primary)">
                        {
                          slab.min_qty
                        }
                      </td>

                      <td className="px-5 py-4 text-(--text-primary)">
                        {slab.max_qty ||
                          "∞"}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-(--status-success-text)">
                        {(
                          slab.discount_pct /
                          100
                        ).toFixed(
                          2,
                        )}
                        %
                      </td>

                      <td className="px-5 py-4 text-right font-medium tabular-nums text-(--text-primary)">
                        {slab.price_override
                          ? formatPaise(
                              slab.price_override,
                            )
                          : "-"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
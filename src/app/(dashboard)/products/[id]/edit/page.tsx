"use client";

/*
  ===================================
  FE-021
  Product Edit Page
  ===================================
*/

import {
  ShieldAlert,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import ProductForm from "@/components/products/ProductForm";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { useAuth } from "@/hooks/useAuth";

export default function EditProductPage() {
  const params = useParams();

  const productId =
    Array.isArray(params.id)
        ? params.id[0]
        : params.id;

  const {
    user,
    isLoading: authLoading,
  } = useAuth();

  if (authLoading) {
    return null;
  }

  /*
    ===================================
    FE-021 CHANGE:
    ADMIN/MANAGER only
    ===================================
  */
    const canManage =
        user?.role === "ADMIN" ||
        user?.role === "MANAGER";

    const isForbidden =
        !canManage; 

  /*
    ===================================
    FE-021 CHANGE:
    Fetch existing product
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
            data: {
            id: string;
            version: number;
            sku: string;
            name: string;
            description?: string;
            base_price: number;
            gst_rate: number;
            hsn_code: string;
            unit: string;
            };
        }>(
            `/products/${productId}`,
        );

      return response.data;
    },
  });

  const product =
    data?.data;

  if (isForbidden) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border border-[var(--status-danger-border)] bg-[var(--card)] p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--status-danger-bg)]">
            <ShieldAlert className="h-7 w-7 text-[var(--status-danger-text)]" />
          </div>

          <h1 className="mt-5 font-[var(--font-heading)] text-2xl font-bold text-[var(--text-primary)]">
            Access Denied
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            You do not have
            permission to edit
            products.
          </p>

          <Button
            className="mt-6 w-full"
            href="/products"
          >
            Back to Products
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-[var(--table-header-bg)]" />

        <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="space-y-4">
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
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--status-danger-text)]">
            Failed to load
            product
          </h2>

          <p className="text-sm text-[var(--text-secondary)]">
            Unable to fetch
            product details.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div>
        <h1 className="font-[var(--font-heading)] text-3xl font-bold text-[var(--text-primary)]">
          Edit Product
        </h1>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Update product
          details, GST and
          pricing configuration.
        </p>
      </div>

      {/* ===================================
          FE-021 CHANGE:
          Reusable edit form
      =================================== */}

      <ProductForm
        mode="edit"
        productId={
          product.id
        }
        initialData={{
          id: product.id,

          /*
            ===================================
            FE-021 CHANGE:
            optimistic concurrency
            ===================================
          */
          version:
            product.version,

          sku:
            product.sku,

          name:
            product.name,

          description:
            product.description,

          base_price:
            product.base_price,

          gst_rate:
            product.gst_rate,

          hsn_code:
            product.hsn_code,

          unit:
            product.unit,
        }}
      />
    </div>
  );
}
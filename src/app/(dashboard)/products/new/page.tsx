"use client";

/*
  ===================================
  FE-021
  Product Create Page
  src/app/(dashboard)/products/new/page.tsx
  ===================================
*/

import {
  ShieldAlert,
} from "lucide-react";

import ProductForm from "@/components/products/ProductForm";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function NewProductPage() {
    const {
        role,
        isLoading,
    } = useAuth();

    if (isLoading) {
    return null;
    }

  /*
    ===================================
    FE-021 CHANGE:
    ADMIN/MANAGER only
    ===================================
  */
    const canManage =
    role === "ADMIN" ||
    role === "MANAGER";


    const isForbidden = !canManage;

  if (isForbidden) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border border-(--status-danger-border) bg-(--card) p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--status-danger-bg)">
            <ShieldAlert className="h-7 w-7 text-(--status-danger-text)" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-(--text-primary)">
            Access Denied
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
            You do not have
            permission to create
            products.
          </p>

          <Link
            href="/products"
            className="w-full"
          >
            <Button className="mt-6 w-full">
              Back to Products
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div>
        <h1 className="font-(--font-heading) text-3xl text-(--text-primary)">
          Create Product
        </h1>

        <p className="mt-1 text-sm text-(--text-secondary)">
          Add a new product
          with GST and pricing
          configuration.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
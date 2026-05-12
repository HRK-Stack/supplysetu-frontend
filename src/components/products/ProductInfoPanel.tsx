"use client";

/*
  ===================================
  FE-020
  Product Information Panel
  ===================================
*/

import {
  BadgePercent,
  Barcode,
  Box,
  FileText,
  Package,
  Receipt,
} from "lucide-react";

import { Card } from "@/components/ui/Card";

import { formatPaise } from "@/lib/format";
import type { Product } from "@/types/product";
import type { ReactNode } from "react";


interface ProductInfoPanelProps {
  product: Product;
}

export default function ProductInfoPanel({
  product,
}: ProductInfoPanelProps) {
  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">

      {/* ===================================
          Header
      =================================== */}

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--table-header-bg)]">
          <Package className="h-5 w-5 text-[var(--text-primary)]" />
        </div>

        <div>
          <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
            Product
            Information
          </h2>

          <p className="text-sm text-[var(--text-secondary)]">
            Product details,
            tax configuration
            and compliance
            information.
          </p>
        </div>
      </div>

      {/* ===================================
          Product Grid
      =================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* SKU */}

        <InfoItem
          icon={
            <Box className="h-4 w-4" />
          }
          label="SKU"
          value={product.sku}
        />

        {/* Product Name */}

        <InfoItem
          icon={
            <Package className="h-4 w-4" />
          }
          label="Product Name"
          value={product.name}
        />

        {/* Base Price */}

        <InfoItem
          icon={
            <Receipt className="h-4 w-4" />
          }
          label="Base Price"
          value={formatPaise(
            product.base_price,
          )}
        />

        {/* GST Rate */}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <BadgePercent className="h-4 w-4" />
            GST Rate
          </div>

          {/* 
            FE-020 CHANGE:
            GST badge
          */}
          <span className="rounded-full border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-2.5 py-1 text-xs font-medium text-[var(--status-info-text)]">
            {product.gst_rate ?? 0}%
          </span>
        </div>

        {/* ===================================
            FE-020 CHANGE:
            HSN prominently displayed
            Mandatory for GST/Tally export
        =================================== */}

        <div className="rounded-2xl border border-[var(--amber-border)] bg-[var(--amber-light)] p-4 md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--amber-deep)]">
            <Barcode className="h-4 w-4" />
            HSN Code
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[var(--white)] px-4 py-2 font-mono text-lg font-semibold tracking-wide text-[var(--text-primary)] shadow-sm">
              {product.hsn_code || "-"}
            </span>

            <span className="text-sm text-[var(--amber-darker)]">
              Mandatory for GST
              & Tally export
            </span>
          </div>
        </div>

        {/* Unit */}

        <InfoItem
          icon={
            <Package className="h-4 w-4" />
          }
          label="Unit"
          value={product.unit}
        />

        {/* Status */}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="mb-2 text-sm text-[var(--text-secondary)]">
            Status
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              product.status ===
              "ACTIVE"
                ? "border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                : "border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]"
            }`}
          >
            {product.status || "UNKNOWN"}
          </span>
        </div>

        {/* Description */}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <FileText className="h-4 w-4" />
            Description
          </div>

          <p className="leading-relaxed text-[var(--text-primary)]">
            {product.description ||
              "No description available."}
          </p>
        </div>
      </div>
    </Card>
  );
}

interface InfoItemProps {
  label: string;

  value: ReactNode;

  icon?: ReactNode;
}

function InfoItem({
  label,
  value,
  icon,
}: InfoItemProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        {icon}
        {label}
      </div>

      <p className="font-medium text-[var(--text-primary)]">
        {value ?? "-"}
      </p>
    </div>
  );
}
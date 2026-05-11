"use client";

/*
  ===================================
  FE-019
  Product Table
  ===================================
*/

import Link from "next/link";

import { formatPaise } from "@/lib/money";
import type { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({
  products,
}: ProductTableProps) {

  /*
    ===================================
    FE-019 CHANGE:
    Empty state
    ===================================
  */
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] py-16 text-center">
        <h3 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
          No products found
        </h3>

        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Try changing your
          filters or search.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">

        {/* ===================================
            Table Header
        =================================== */}

        <thead className="bg-[var(--table-header-bg)]">
          <tr className="border-b border-[var(--table-border)]">
            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              SKU
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Product Name
            </th>

            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Base Price
            </th>

            <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              GST Rate
            </th>

            <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              HSN Code
            </th>

            <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Unit
            </th>

            <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Status
            </th>
          </tr>
        </thead>

        {/* ===================================
            Table Body
        =================================== */}

        <tbody>
          {products.map(
            (product) => (
              <tr
                key={
                  product.id
                }

                /*
                  FE-019 CHANGE:
                  Row navigation
                */
                className="cursor-pointer border-b border-[var(--table-border)] transition-colors duration-200 hover:bg-[var(--table-row-hover)]"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/products/${product.id}`}
                    className="font-medium text-[var(--text-primary)]"
                  >
                    {product.sku}
                  </Link>
                </td>

                <td className="px-5 py-4 text-[var(--text-secondary)]">
                  {
                    product.name
                  }
                </td>

                {/* 
                  FE-019 CHANGE:
                  formatPaise()
                */}
                <td className="px-5 py-4 text-right font-medium tabular-nums text-[var(--text-primary)]">
                  {formatPaise(
                    product.base_price,
                  )}
                </td>

                <td className="px-5 py-4 text-center">
                  <span className="rounded-full border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-2.5 py-1 text-xs font-medium text-[var(--status-info-text)]">
                    {
                      product.gst_rate
                    }
                    %
                  </span>
                </td>

                {/* 
                  FE-019 CHANGE:
                  Monospace HSN badge
                */}
                <td className="px-5 py-4 text-center">
                  <span className="rounded-lg bg-[var(--table-header-bg)] px-3 py-1 font-mono text-xs text-[var(--text-primary)]">
                    {
                      product.hsn_code
                    }
                  </span>
                </td>

                <td className="px-5 py-4 text-center text-[var(--text-secondary)]">
                  {
                    product.unit
                  }
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.status ===
                      "ACTIVE"
                        ? "border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                        : "border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]"
                    }`}
                  >
                    {
                      product.status
                    }
                  </span>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
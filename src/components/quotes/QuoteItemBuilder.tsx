"use client";

/*
  ===================================
  FE-024
  Quote Item Builder
  ===================================
*/

import { useState } from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {  
  Plus,
  Trash2,
} from "lucide-react";

import api from "@/lib/api";

import { useRouter }
from "next/navigation";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import ProductSearch from "@/components/quotes/ProductSearch";
import PricingPreview from "@/components/quotes/PricingPreview";

import { useAuth } from "@/hooks/useAuth";

import { formatPaise } from "@/lib/format";
import type { Product } from "@/types/product";
import type { PricingSnapshot } from "@/types/pricing";

interface QuoteItemBuilderProps {
  dealerId: string;
}

interface QuoteItem {
  id: string;
  product: Product;
  quantity: number;
  pricing: PricingSnapshot & {
    subtotal: number;
  };
}

export default function QuoteItemBuilder({
  dealerId,
}: QuoteItemBuilderProps) {
  const { user } = useAuth();
  const router = useRouter();

  /*
    ===================================
    FE-024 CHANGE:
    Item lines
    ===================================
  */
    const [items, setItems] =
        useState<QuoteItem[]>([]);

    const [
        selectedProduct,
        setSelectedProduct,
    ] = useState<Product | null>(null);

  const [quantity, setQuantity] =
    useState(1);

  /*
    ===================================
    FE-024 CHANGE:
    Override price
    ===================================
  */
  const [
    overridePrice,
    setOverridePrice,
  ] = useState("");

  const queryClient =
    useQueryClient();
  /*
    ===================================
    FE-024 CHANGE:
    Live pricing preview
    ===================================
  */

  
  const pricingMutation =
    useMutation({
      mutationFn: async () => {
        if (
          !selectedProduct
        ) {
          throw new Error(
            "Product not selected",
          );
        }

        const response =
          await api.post<{
            data: PricingSnapshot & {
                subtotal: number;
            };
            }>(
            "/pricing/preview",
            {
              dealer_id:
                dealerId,

              product_id:
                selectedProduct.id,

              quantity,

              /*
                ===================================
                FE-024 CHANGE:
                override_price
                ===================================
              */
              override_price:
                overridePrice
                  ? Number(
                      overridePrice,
                    ) *
                    100
                  : null,
            },
          );

        return response.data;
      },
    });

  /*
    ===================================
    FE-024 CHANGE:
    Add item line
    ===================================
  */
  const handleAddItem =
    async () => {
      if (
        !selectedProduct
      ) {
        return;
      }

      const pricing =
        await pricingMutation.mutateAsync();

      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),

          product:
            selectedProduct,

          quantity,

          pricing:
            pricing.data,
        },
      ]);

      /*
        Reset
      */
      setSelectedProduct(
        null,
      );

      setQuantity(1);

      setOverridePrice("");
    };

  /*
    ===================================
    FE-024 CHANGE:
    Remove item line
    ===================================
  */
  const removeItem = (
    id: string,
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          item.id !== id,
      ),
    );
  };

  /*
    ===================================
    FE-024 CHANGE:
    Quote create
    ===================================
  */

  
  const createQuoteMutation =
    useMutation({
      mutationFn: async () => {
        const payload = {
          dealer_id: dealerId,

          valid_days: 30,

          items: items.map(
            (item) => ({
              product_id:
                item.product.id,

              quantity:
                item.quantity,

              final_unit_price:
                Math.round(
                  item.pricing
                    .final_unit_price,
                ),

              final_price_with_gst:
                Math.round(
                  item.pricing
                    .final_price_with_gst,
                ),

              subtotal:
                Math.round(
                  (
                    item.pricing
                      .final_price_with_gst ?? 0
                  ) * item.quantity,
                ),

              override_price:
                item.pricing
                  .override_price ??
                null,
            }),
          ),
        };

        console.log(
          "FINAL QUOTE PAYLOAD",
          JSON.stringify(
            payload,
            null,
            2,
          ),
        );

        const response =
          await api.post(
            "/quotes",
            payload,
          );

        console.log(
          "QUOTE RESPONSE",
          response.data,
        );

        return response.data;
      },

      onSuccess: async () => {

        await queryClient
          .invalidateQueries({
            queryKey: ["quotes"],
          });

        router.push("/quotes");
      },
    });

  const subtotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        (
          item.pricing
            .subtotal ?? 0
        ),
      0,
    );

  return (
    <div className="space-y-6">

      {/* ===================================
          Product Search
      =================================== */}

      <Card className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-(--text-primary)">
              Add Quote Items
            </h2>

            <p className="mt-1 text-sm text-(--text-secondary)">
              Search products
              and build quote
              line items.
            </p>
          </div>

          <div className="rounded-full border border-(--status-info-border) bg-(--status-info-bg) px-3 py-1 text-xs font-medium text-(--status-info-text)">
            Step 2
          </div>
        </div>

        <ProductSearch
          selectedProductId={
            selectedProduct?.id ||
            null
          }
          onSelect={
            setSelectedProduct
          }
        />

        {/* ===================================
            Quantity + Override
        =================================== */}

        {selectedProduct && (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Quantity */}

            <Input
              type="number"
              min={1}
              label="Quantity"
              value={quantity}
              onChange={(e) => {
                const value =
                    Number(
                    e.target.value,
                    );

                if (
                    !Number.isNaN(value) &&
                    value >= 1
                ) {
                    setQuantity(value);
                }
            }}
            />

            {/* ===================================
                FE-024 CHANGE:
                Override price only
                ADMIN/MANAGER
            =================================== */}

            {(user?.role ===
              "ADMIN" ||
              user?.role ===
                "MANAGER") && (
              <Input
                type="number"
                min={0}
                label="Override Price (₹)"
                value={
                  overridePrice
                }
                onChange={(e) =>
                  setOverridePrice(
                    e.target.value,
                  )
                }
              />
            )}

            {/* Actions */}

            <div className="flex items-end">
              <Button
                type="button"
                className="w-full"
                onClick={
                  handleAddItem
                }
                disabled={
                  pricingMutation.isPending
                }
              >
                <Plus className="h-4 w-4" />

                {pricingMutation.isPending
                  ? "Calculating..."
                  : "Add Item"}
              </Button>
            </div>
          </div>
        )}

        {/* ===================================
            Pricing Preview
        =================================== */}

        {pricingMutation.data
          ?.data && (
          <div className="mt-6">
            <PricingPreview
              pricing={
                pricingMutation
                  .data.data
              }
            />
          </div>
        )}
      </Card>

      {/* ===================================
          Added Items
      =================================== */}

      <Card className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm">

        <div className="border-b border-(--table-border) px-6 py-5">
          <h2 className="text-xl font-semibold text-(--text-primary)">
            Quote Items
          </h2>
        </div>

        {items.length ===
        0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-(--text-muted)">
              No items added
              yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">

              {/* Table Head */}

              <thead className="bg-(--table-header-bg)">
                <tr className="border-b border-(--table-border)">
                  <th scope="col" className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Product
                  </th>

                  <th scope="col" className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Qty
                  </th>

                  <th scope="col" className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Final Unit Price
                  </th>

                  <th scope="col" className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Final Price GST
                  </th>

                  <th scope="col" className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Subtotal
                  </th>

                  <th scope="col" className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}

              <tbody>
                {items.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                      className="border-b border-(--table-border)"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-(--text-primary)">
                            {
                              item
                                .product
                                .name
                            }
                          </p>

                          <p className="mt-1 text-xs text-(--text-secondary)">
                            {
                              item
                                .product
                                .sku
                            }
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        {
                          item.quantity
                        }
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-(--text-primary)">
                        {formatPaise(
                          item
                            .pricing
                            .final_unit_price,
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-(--text-primary)">
                        {formatPaise(
                          item
                            .pricing
                            .final_price_with_gst,
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-(--navy)">
                        {formatPaise(
                          item
                            .pricing
                            .subtotal,
                        )}
                      </td>

                      {/* Remove */}

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.id,
                            )
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-(--status-danger-border) bg-(--status-danger-bg) p-2 text-(--status-danger-text) transition-colors duration-200 hover:opacity-80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ===================================
          Footer
      =================================== */}

      <div className="flex flex-col gap-4 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">

        {/* Summary */}

        <div>
          <p className="text-sm text-(--text-secondary)">
            Quote Subtotal
          </p>

          <h2 className="mt-1 text-3xl font-bold text-(--text-primary)">
            {formatPaise(
              subtotal,
            )}
          </h2>
        </div>

        {/* Actions */}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
          >
            Back
          </Button>

          <Button
            type="button"
                onClick={() =>
                    createQuoteMutation.mutate()
            }
            disabled={
              items.length ===
                0 ||
              createQuoteMutation.isPending
            }
          >
            {createQuoteMutation.isPending
              ? "Creating..."
              : "Create Quote"}
          </Button>
        </div>
      </div>
    </div>
  );
}
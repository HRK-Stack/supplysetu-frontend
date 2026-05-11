// src/components/quotes/RevisionCreator.tsx

"use client";

/*
  ===================================
  FE-028
  Quote Negotiation / Revision
  ===================================
*/

import { useMemo, useState } from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Minus,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";

import type {
  Quote,
  QuoteItem,
} from "@/types/quote";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import ProductSearch from "@/components/quotes/ProductSearch";

import { useAuth } from "@/hooks/useAuth";

import { formatPaise } from "@/lib/money";
import type { Product } from "@/types/product";
import { AxiosError } from "axios";


interface RevisionCreatorProps {
  quote: Quote;

  onSuccess?: () => void;
}

type RevisionItem = {
  id: string;

  product_id: string;

  product_name: string;

  sku: string;

  quantity: number;

  final_price_with_gst: number;

  override_price: string | number;
};

export default function RevisionCreator({
  quote,
  onSuccess,
}: RevisionCreatorProps) {
  const queryClient =
    useQueryClient();

  const { user } = useAuth();

  /*
    ===================================
    FE-028 CHANGE:
    Modal state
    ===================================
  */
  const [open, setOpen] =
    useState(false);

  /*
    ===================================
    FE-028 CHANGE:
    Notes
    ===================================
  */
  const [notes, setNotes] =
    useState("");

  /*
    ===================================
    FE-028 CHANGE:
    Pre-populated items
    from current revision
    ===================================
  */
  const [items, setItems] =
    useState<RevisionItem[]>(
      quote.current_revision?.items?.map(
        (item: QuoteItem) => ({
          id: crypto.randomUUID(),

          product_id:
            item.product_id,

          product_name:
            item.product_name,

          sku: item.sku,

          quantity:
            item.quantity,

          final_price_with_gst:
            item.final_price_with_gst,

          /*
            ===================================
            FE-028 CHANGE:
            Override price
            ===================================
          */
          override_price:
            item.override_price ||
            "",
        }),
      ) || [],
    );

  /*
    ===================================
    FE-028 CHANGE:
    Add products
    ===================================
  */
  const [
    selectedProduct,
    setSelectedProduct,
    ] = useState<Product | null>(
    null,
    );

  /*
    ===================================
    FE-028 CHANGE:
    MANAGER/ADMIN only
    ===================================
  */
  const canOverridePrice =
    user?.role ===
      "ADMIN" ||
    user?.role ===
      "MANAGER";

  /*
    ===================================
    FE-028 CHANGE:
    Add new product
    ===================================
  */
  const handleAddProduct =
    () => {
      if (
        !selectedProduct
      ) {
        return;
      }

      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),

          product_id:
            selectedProduct.id,

          product_name:
            selectedProduct.name,

          sku:
            selectedProduct.sku,

          quantity: 1,

          final_price_with_gst:
            selectedProduct.base_price,

          override_price:
            "",
        },
      ]);

      setSelectedProduct(
        null,
      );
    };

  /*
    ===================================
    FE-028 CHANGE:
    Update quantity
    ===================================
  */
  const updateQuantity = (
    id: string,
    quantity: number,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                quantity < 1
                  ? 1
                  : quantity,
            }
          : item,
      ),
    );
  };

  /*
    ===================================
    FE-028 CHANGE:
    Override price
    ===================================
  */
  const updateOverridePrice =
    (
      id: string,
      value: string,
    ) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                override_price:
                  value,
              }
            : item,
        ),
      );
    };

  /*
    ===================================
    FE-028 CHANGE:
    Remove item
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
    FE-028 CHANGE:
    Create revision
    ===================================
  */
  const createRevisionMutation =
    useMutation<
        unknown,
        AxiosError
    >({
      mutationFn:
        async () => {
          const response =
            await api.post(
              `/quotes/${quote.id}/revisions`,
              {
                /*
                  ===================================
                  FE-028 CHANGE:
                  Optimistic lock
                  ===================================
                */
                quote_version:
                  quote.version,

                notes,

                items:
                  items.map(
                    (
                      item,
                    ) => ({
                      product_id:
                        item.product_id,

                      quantity:
                        item.quantity,

                      /*
                        ===================================
                        FE-028 CHANGE:
                        Rupees -> paise
                        ===================================
                      */
                      override_price:
                        item.override_price
                          ? Number(
                              item.override_price,
                            ) *
                            100
                          : null,
                    }),
                  ),
              },
            );

          return response.data;
        },

      /*
        ===================================
        FE-028 CHANGE:
        Success
        ===================================
      */
      onSuccess:
        async () => {
          await queryClient.invalidateQueries(
            {
              queryKey: [
                "quote-detail",
                quote.id,
              ],
            },
          );

          await queryClient.invalidateQueries(
            {
              queryKey: [
                "quote-revisions",
                quote.id,
              ],
            },
          );

          setOpen(false);

          onSuccess?.();
        },

      /*
        ===================================
        FE-028 CHANGE:
        409 conflict
        ===================================
      */
      onError: (
        error: AxiosError,
      ) => {
        if (
          error?.response
            ?.status ===
          409
        ) {
          alert(
            "Version conflict. Please refresh quote.",
          );

          onSuccess?.();
        }
      },
    });

  /*
    ===================================
    FE-028 CHANGE:
    Visibility rules
    ===================================
  */
  const canCreateRevision =
    (
      quote.status ===
        "SENT" ||
      quote.status ===
        "NEGOTIATION"
    ) &&
    canOverridePrice;

  /*
    ===================================
    FE-028 CHANGE:
    Total preview
    ===================================
  */
  const total =
  useMemo(
    () =>
      items.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          (
            item.override_price
              ? Number(
                  item.override_price,
                ) * 100
              : item.final_price_with_gst
          ) *
            item.quantity,
        0,
      ),
    [items],
  );

  if (
    !canCreateRevision
  ) {
    return null;
  }

  return (
    <>
      {/* ===================================
          Create Revision Button
      =================================== */}

      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          setOpen(true)
        }
      >
        <RefreshCcw className="h-4 w-4" />

        Create Revision
      </Button>

      {/* ===================================
          Modal
      =================================== */}

      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[rgba(15,23,42,0.4)] p-4">

          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-xl)]">

            {/* ===================================
                Header
            =================================== */}

            <div className="border-b border-[var(--table-border)] p-6">

              <h2 className="font-[var(--font-heading)] text-2xl font-semibold text-[var(--text-primary)]">
                Create Revision
              </h2>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Adjust quantities,
                products and
                pricing for
                negotiation.
              </p>
            </div>

            <div className="space-y-6 p-6">

              {/* ===================================
                  Notes
              =================================== */}

              <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

                <Textarea
                  label="Revision Notes"
                  placeholder="Enter negotiation notes..."
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value,
                    )
                  }
                />
              </Card>

              {/* ===================================
                  Product Search
              =================================== */}

              <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

                <div className="mb-4 flex items-center justify-between">

                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      Add Products
                    </h3>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Search and add
                      products to this
                      revision.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={
                      handleAddProduct
                    }
                    disabled={
                      !selectedProduct
                    }
                  >
                    <Plus className="h-4 w-4" />

                    Add Product
                  </Button>
                </div>

                <ProductSearch
                  selectedProductId={
                    selectedProduct?.id
                  }
                  onSelect={
                    setSelectedProduct
                  }
                />
              </Card>

              {/* ===================================
                  Revision Items
              =================================== */}

              <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

                <div className="border-b border-[var(--table-border)] px-6 py-5">

                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Revision Items
                  </h3>
                </div>

                <div className="overflow-x-auto">

                  <table className="min-w-full">

                    <thead className="bg-[var(--table-header-bg)]">

                      <tr className="border-b border-[var(--table-border)]">

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Product
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Quantity
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Override Price
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Preview Total
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {items.map(
                        (
                          item,
                        ) => (
                          <tr
                            key={
                              item.id
                            }
                            className="border-b border-[var(--table-border)]"
                          >

                            {/* Product */}

                            <td className="px-5 py-4">

                              <div>

                                <p className="font-medium text-[var(--text-primary)]">
                                  {
                                    item.product_name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                  SKU:{" "}
                                  {
                                    item.sku
                                  }
                                </p>
                              </div>
                            </td>

                            {/* Quantity */}

                            <td className="px-5 py-4">

                              <div className="flex items-center justify-center gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity -
                                        1,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]"
                                >
                                  <Minus className="h-4 w-4 text-[var(--text-primary)]" />
                                </button>

                                <Input
                                  type="number"
                                  min={1}
                                  value={
                                    item.quantity
                                  }
                                  onChange={(e) => {
                                    const value =
                                        Number(
                                        e.target.value,
                                        );

                                    updateQuantity(
                                        item.id,
                                        Number.isNaN(value)
                                        ? 1
                                        : value,
                                    );
                                  }}
                                  className="w-20 text-center"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity +
                                        1,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]"
                                >
                                  <Plus className="h-4 w-4 text-[var(--text-primary)]" />
                                </button>
                              </div>
                            </td>

                            {/* Override */}

                            <td className="px-5 py-4 text-right">

                              {canOverridePrice ? (
                                <Input
                                  value={
                                    item.override_price
                                  }
                                  onChange={(
                                    e,
                                  ) =>
                                    updateOverridePrice(
                                      item.id,
                                      e
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="₹"
                                  className="ml-auto w-28"
                                />
                              ) : (
                                <span className="text-sm text-[var(--text-muted)]">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Preview */}

                            <td className="px-5 py-4 text-right font-semibold text-[var(--navy)]">

                              {formatPaise(
                                (
                                    item.override_price
                                        ? Number(
                                            item.override_price,
                                        ) * 100
                                        : item.final_price_with_gst
                                ) * item.quantity,
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
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]"
                              >
                                <Trash2 className="h-4 w-4 text-[var(--status-danger-text)]" />
                              </button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* ===================================
                  Footer
              =================================== */}

              <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <p className="text-sm text-[var(--text-secondary)]">
                    Revision Preview
                    Total
                  </p>

                  <h2 className="mt-1 text-3xl font-bold text-[var(--text-primary)]">

                    {formatPaise(
                      total,
                    )}
                  </h2>
                </div>

                <div className="flex gap-3">

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setOpen(
                        false,
                      )
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      createRevisionMutation.mutate()
                    }
                    disabled={
                      createRevisionMutation.isPending ||
                      items.length ===
                        0
                    }
                  >
                    {createRevisionMutation.isPending
                      ? "Creating..."
                      : "Create Revision"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
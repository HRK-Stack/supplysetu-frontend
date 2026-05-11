// src/components/schemes/SchemeForm.tsx

"use client";

/*
  ===================================
  FE-037
  Scheme Form
  ===================================
*/

import {
  useEffect,
} from "react";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  useForm,
} from "react-hook-form";

import {
  z,
} from "zod";
import type {
  AxiosError,
} from "axios";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import type { Scheme } from "@/types/scheme";

const formSchema =
  z.object({
    name: z
      .string()
      .min(
        2,
        "Name is required",
      ),

    discount_pct:
        z.coerce
            .number()
            .min(
                0,
                "Discount cannot be negative",
            )
            .max(
                100,
                "Discount cannot exceed 100%",
            ),

    start_date:
        z.string()
            .min(
                1,
                "Start date is required",
            ),

    end_date:
        z.string()
            .min(
                1,
                "End date is required",
            ),

    product_ids:
      z.array(
        z.string(),
      ),

    territory_ids:
      z.array(
        z.string(),
      ),

    dealer_ids:
      z.array(
        z.string(),
      ),
  }).refine(
        (data) =>
        new Date(data.end_date) >=
        new Date(data.start_date),
        {
        message:
            "End date must be after start date",
        path: ["end_date"],
        },
    );

type FormValues =
  z.infer<
    typeof formSchema
  >;

  type LookupItem = {
  id: string;
  name: string;
};

interface LookupResponse {
  data: LookupItem[];
}

interface SchemeFormProps {
  open: boolean;

  scheme:
    | Scheme
    | null;

  onClose: () => void;

  onSuccess?: () => void;
}

interface SchemeMutationResponse {
  success: boolean;
}

export default function SchemeForm({
  open,
  scheme,
  onClose,
  onSuccess,
}: SchemeFormProps) {
  const isEditMode =
    Boolean(scheme);

  /*
    ===================================
    FE-037 CHANGE:
    Lookup data
    ===================================
  */
  const {
    data: products,
  } = useQuery<LookupItem[]>({
    enabled: open,
    queryKey: [
      "scheme-products",
    ],

    queryFn:
      async () => {
        const response =
          await api.get<LookupResponse>(
            "/products?status=ACTIVE",
          );

        return response.data
          ?.data;
      },
  });

  const {
    data: territories,
  } = useQuery<LookupItem[]>({
    enabled: open,
    queryKey: [
      "scheme-territories",
    ],

    queryFn:
      async () => {
        const response =
          await api.get<LookupResponse>(
            "/territories",
          );

        return response.data
          ?.data;
      },
  });

  const {
    data: dealers,
  } = useQuery<LookupItem[]>({
    enabled: open,
    queryKey: [
      "scheme-dealers",
    ],

    queryFn:
      async () => {
        const response =
          await api.get<LookupResponse>(
            "/dealers?status=ACTIVE",
          );

        return response.data
          ?.data;
      },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormValues>({
    resolver:
      zodResolver(
        formSchema,
      ),

    defaultValues: {
      name: "",
      discount_pct: 0,
      start_date: "",
      end_date: "",
      product_ids: [],
      territory_ids:
        [],
      dealer_ids: [],
    },
  });

  /*
    ===================================
    FE-037 CHANGE:
    Populate edit form
    ===================================
  */
  useEffect(() => {
    if (scheme) {
        reset({
        name:
            scheme.name,

        discount_pct:
            scheme.discount_pct /
            100,

        start_date:
            scheme.start_date?.split(
            "T",
            )[0],

        end_date:
            scheme.end_date?.split(
            "T",
            )[0],

        product_ids:
            scheme
            .applies_to
            ?.products ??
            [],

        territory_ids:
            scheme
            .applies_to
            ?.territories ??
            [],

        dealer_ids:
            scheme
            .applies_to
            ?.dealers ??
            [],
        });
    } else {
        reset({
        name: "",
        discount_pct: 0,
        start_date: "",
        end_date: "",
        product_ids: [],
        territory_ids: [],
        dealer_ids: [],
        });
    }
    }, [
    scheme,
    reset,
  ]);

  /*
    ===================================
    FE-037 CHANGE:
    Create scheme
    ===================================
  */
  const createMutation =
    useMutation<
        SchemeMutationResponse,
        AxiosError,
        FormValues
    >({
      mutationFn: async (
        values: FormValues,
        ) => {
        const response =
            await api.post<SchemeMutationResponse>(
            "/schemes",
            {
                name:
                values.name,

                discount_pct:
                Math.round(
                    values.discount_pct *
                    100,
                ),

                start_date:
                values.start_date,

                end_date:
                values.end_date,

                applies_to: {
                product_ids:
                    values.product_ids,

                territory_ids:
                    values.territory_ids,

                dealer_ids:
                    values.dealer_ids,
                },
            },
            );

        return response.data;
        },

      onSuccess: () => {
        onSuccess?.();
      },

      onError: (
        error: AxiosError,
        ) => {
        if (
            error.response?.status ===
            409
        ) {
            alert(
            "A scheme with similar configuration already exists.",
            );
        }
    },
    });

  /*
    ===================================
    FE-037 CHANGE:
    Update scheme
    ===================================
  */
  const updateMutation =
    useMutation<
        SchemeMutationResponse,
        AxiosError,
        FormValues
    >({
      mutationFn: async (
        values: FormValues,
        ) => {
        const response =
            await api.patch<SchemeMutationResponse>(
            `/schemes/${scheme?.id}`,
            {
                name:
                values.name,

                discount_pct:
                Math.round(
                    values.discount_pct *
                    100,
                ),

                start_date:
                values.start_date,

                end_date:
                values.end_date,

                applies_to: {
                product_ids:
                    values.product_ids,

                territory_ids:
                    values.territory_ids,

                dealer_ids:
                    values.dealer_ids,
                },

                version:
                scheme?.version,
            },
            );

        return response.data;
        },

      onSuccess: () => {
        onSuccess?.();
      },

      /*
        ===================================
        FE-037 CHANGE:
        Version conflict
        ===================================
      */
      onError: (
        error: AxiosError,
      ) => {
        if (
          error
            ?.response
            ?.status ===
          409
        ) {
          alert(
            "Version conflict detected. Please refresh.",
          );
        }
      },
    });

  const onSubmit =
    async (
      values: FormValues,
    ) => {
      if (
        isEditMode
      ) {
        await updateMutation.mutateAsync(
          values,
        );
      } else {
        await createMutation.mutateAsync(
          values,
        );
      }
    };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">

        {/* Header */}

        <div className="mb-6 flex items-start justify-between">

          <div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)]">

              {isEditMode
                ? "Edit Scheme"
                : "Add Scheme"}
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Configure
              discount schemes
              and applicability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
                reset();

                onClose();
            }}

            className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit(
            onSubmit,
          )}

          className="space-y-5"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <Input
              label="Scheme Name"

              placeholder="Enter scheme name"

              error={
                errors.name
                  ?.message
              }

              {...register(
                "name",
              )}
            />

            {/* ===================================
                FE-037 CHANGE:
                Basis points conversion
            =================================== */}

            <Input
              label="Discount %"

              type="number"

              step="0.01"

              placeholder="Enter discount percentage"

              error={
                errors
                  .discount_pct
                  ?.message
              }

              {...register(
                "discount_pct",
              )}
            />

            <Input
              label="Start Date"

              type="date"

              error={
                errors
                  .start_date
                  ?.message
              }

              {...register(
                "start_date",
              )}
            />

            <Input
              label="End Date"

              type="date"

              error={
                errors
                  .end_date
                  ?.message
              }

              {...register(
                "end_date",
              )}
            />
          </div>

          {/* ===================================
              FE-037 CHANGE:
              Multi select applies_to
          =================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Products */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Products
              </label>

              <select
                multiple

                {...register(
                  "product_ids",
                )}

                className="min-h-[180px] w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--text-primary)] outline-none"
              >
                {products?.map(
                  (
                    product: LookupItem,
                  ) => (
                    <option
                      key={
                        product.id
                      }

                      value={
                        product.id
                      }
                    >
                      {
                        product.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Territories */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Territories
              </label>

              <select
                multiple

                {...register(
                  "territory_ids",
                )}

                className="min-h-[180px] w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--text-primary)] outline-none"
              >
                {territories?.map(
                  (
                    territory: LookupItem,
                  ) => (
                    <option
                      key={
                        territory.id
                      }

                      value={
                        territory.id
                      }
                    >
                      {
                        territory.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Dealers */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Dealers
              </label>

              <select
                multiple

                {...register(
                  "dealer_ids",
                )}

                className="min-h-[180px] w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--text-primary)] outline-none"
              >
                {dealers?.map(
                  (
                    dealer: LookupItem,
                  ) => (
                    <option
                      key={
                        dealer.id
                      }

                      value={
                        dealer.id
                      }
                    >
                      {
                        dealer.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* ===================================
              FE-037 CHANGE:
              Universal apply note
          =================================== */}

          <div className="rounded-2xl border border-[var(--status-info-border)] bg-[var(--status-info-bg)] p-4">

            <p className="text-sm text-[var(--status-info-text)]">
              Leave all apply
              selections empty
              to apply this
              scheme
              universally.
            </p>
          </div>

          {/* Footer */}

          <div className="flex items-center justify-end gap-3 pt-4">

            <Button
              type="button"

              variant="secondary"

              onClick={() => {
                reset();

                onClose();
            }}
            >
              Cancel
            </Button>

            <Button
              type="submit"

              disabled={
                isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {isEditMode
                ? updateMutation.isPending
                  ? "Updating..."
                  : "Update Scheme"
                : createMutation.isPending
                ? "Creating..."
                : "Create Scheme"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
// src/components/dealers/DealerForm.tsx


"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const gstinRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const formSchema = z.object({
  name: z
    .string()
    .min(
      2,
      "Dealer name must be at least 2 characters",
    ),

  contact_name: z
    .string()
    .min(
      2,
      "Contact name is required",
    ),

  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter valid 10-digit Indian mobile number",
    ),

  email: z
    .string()
    .email("Enter valid email address"),

  gstin: z
    .string()
    .length(
      15,
      "GSTIN must be 15 characters",
    )
    .regex(
      gstinRegex,
      "Enter valid GSTIN",
    ),

  address: z
    .string()
    .min(5, "Address is required"),

  territory_id: z
    .string()
    .uuid("Select territory"),

  discount_pct: z
    .number()
    .min(0)
    .max(50),

  credit_limit: z
    .number()
    .min(0),
});

type FormValues = z.infer<
  typeof formSchema
>;

interface DealerFormProps {
  mode?: "create" | "edit";

  dealerId?: string;

  initialData?: {
    id: string;
    version: number;

    name: string;
    contact_name: string;
    phone: string;
    email: string;
    gstin: string;
    address: string;

    territory_id: string;

    discount_pct: number;
    credit_limit: number;
  };
}

export default function DealerForm({
  mode = "create",
  dealerId,
  initialData,
}: DealerFormProps) {
  const router = useRouter();

  const {
    data: territoryResponse,
    isLoading: territoryLoading,
  } = useQuery({
    queryKey: ["territories"],

    queryFn: async () => {
      const response =
        await api.get(
          "/territories?page=1&page_size=100",
        );

      return response.data;
    },
  });

  const territories =
    territoryResponse?.data || [];

  const territoryOptions =
    useMemo(
      () =>
        territories.map(
          (territory: any) => ({
            label: territory.name,
            value: territory.id,
          }),
        ),
      [territories],
    );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormValues>({
    resolver:
      zodResolver(formSchema),

    defaultValues: {
      name:
        initialData?.name || "",

      contact_name:
        initialData?.contact_name ||
        "",

      phone:
        initialData?.phone || "",

      email:
        initialData?.email || "",

      gstin:
        initialData?.gstin || "",

      address:
        initialData?.address || "",

      territory_id:
        initialData?.territory_id ||
        "",

      discount_pct:
        initialData?.discount_pct ?? 0,

      credit_limit:
        initialData?.credit_limit ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (
      values: FormValues,
    ) => {
      /*
        convert % → basis points
      */
      const discountBasisPoints =
        Math.round(
          values.discount_pct *
            100,
        );

      /*
        convert rupees → paise
        integer arithmetic only
      */
      const creditLimitPaise =
        values.credit_limit *
        100;

      const payload = {
        name: values.name,

        contact_name:
          values.contact_name,

        phone: values.phone,

        email: values.email,

        gstin: values.gstin,

        address: values.address,

        territory_id:
          values.territory_id,

        discount_pct:
          discountBasisPoints,

        credit_limit:
          creditLimitPaise,

        /*
          REQUIRED for optimistic concurrency
        */
        ...(mode === "edit" && {
          version:
            initialData?.version,
        }),
      };

      if (mode === "edit") {
        const response =
          await api.patch(
            `/dealers/${dealerId}`,
            payload,
          );

        return response.data;
      }

      const response =
        await api.post(
          "/dealers",
          payload,
        );

      return response.data;
    },

    onSuccess: (response) => {
      toast.success(
        mode === "edit"
          ? "Dealer updated successfully"
          : "Dealer created successfully",
      );

      router.push(
        `/dealers/${response.data.id}`,
      );
    },

    onError: async (
      error: any,
    ) => {
      /*
        optimistic concurrency
      */
      if (
        error?.response?.status ===
        409
      ) {
        toast.error(
          "Data changed by another user. Please refresh.",
        );

        /*
          refetch latest data
        */
        if (
          mode === "edit" &&
          dealerId
        ) {
          router.refresh();
        }

        return;
      }

      if (
        error?.response?.status ===
        403
      ) {
        toast.error(
          "You do not have permission for this action.",
        );

        return;
      }

      toast.error(
        error?.response?.data
          ?.error?.message ||
          "Operation failed",
      );
    },
  });

  const onSubmit = async (
    values: FormValues,
  ) => {
    await mutation.mutateAsync(
      values,
    );
  };

  return (
    <Card className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg)] p-6">
      <form
        onSubmit={handleSubmit(
          onSubmit,
        )}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="Dealer Name"
            placeholder="Enter dealer name"
            error={
              errors.name?.message
            }
            {...register("name")}
          />

          <Input
            label="Contact Name"
            placeholder="Enter contact name"
            error={
              errors
                .contact_name
                ?.message
            }
            {...register(
              "contact_name",
            )}
          />

          <Input
            label="Phone Number"
            placeholder="9876543210"
            error={
              errors.phone?.message
            }
            {...register("phone")}
          />

          <Input
            label="Email Address"
            placeholder="dealer@example.com"
            error={
              errors.email?.message
            }
            {...register("email")}
          />

          <Input
            label="GSTIN"
            placeholder="27ABCDE1234F1Z5"
            error={
              errors.gstin?.message
            }
            {...register("gstin")}
          />

          <div>
            <Select
              label="Territory"
              value={watch(
                "territory_id",
              )}
              onChange={(
                value,
              ) =>
                setValue(
                  "territory_id",
                  value,
                  {
                    shouldValidate: true,
                    shouldDirty: true,
                  },
                )
              }
              options={
                territoryOptions
              }
              placeholder={
                territoryLoading
                  ? "Loading territories..."
                  : "Select territory"
              }
            />

            {errors.territory_id && (
              <p className="mt-1 text-xs text-red-500">
                {
                  errors
                    .territory_id
                    .message
                }
              </p>
            )}
          </div>

          <Input
            type="number"
            label="Dealer Discount (%)"
            placeholder="5"
            error={
              errors.discount_pct
                ?.message
            }
            {...register(
              "discount_pct",
              {
                valueAsNumber: true,
              },
            )}
          />

          <Input
            type="number"
            label="Credit Limit (₹)"
            placeholder="100000"
            error={
              errors.credit_limit
                ?.message
            }
            {...register(
              "credit_limit",
              {
                valueAsNumber: true,
              },
            )}
          />
        </div>

        <Input
          label="Address"
          placeholder="Enter full business address"
          error={
            errors.address?.message
          }
          {...register("address")}
        />

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/dealers",
              )
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              mutation.isPending
            }
          >
            {mutation.isPending
              ? mode === "edit"
                ? "Updating Dealer..."
                : "Creating Dealer..."
              : mode ===
                "edit"
              ? "Update Dealer"
              : "Create Dealer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
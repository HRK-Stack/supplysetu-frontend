"use client";

/*
  ===================================
  FE-021
  Product Create/Edit Form
  ===================================
*/

import { useRouter } from "next/navigation";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  useForm,
} from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";

import { toast } from "sonner";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const gstRates = [
  "0",
  "5",
  "12",
  "18",
  "28",
] as const;

/*
  ===================================
  FE-021 CHANGE:
  HSN validation
  4 / 6 / 8 digits only
  ===================================
*/
const hsnRegex =
  /^([0-9]{4}|[0-9]{6}|[0-9]{8})$/;

const formSchema = z.object({
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(
      64,
      "SKU max length is 64 characters",
    ),

  name: z
    .string()
    .min(
      1,
      "Product name is required",
    ),

  description:
    z.string().optional(),

  /*
    ===================================
    FE-021 CHANGE:
    Price input in rupees
    ===================================
  */
  base_price: z
    .number()
    .min(
      0,
      "Base price cannot be negative",
    ),

  gst_rate: z.enum(
    gstRates,
    {
      required_error:
        "Select GST rate",
    },
  ),

  /*
    ===================================
    FE-021 CHANGE:
    HSN validation
    ===================================
  */
  hsn_code: z
    .string()
    .regex(
      hsnRegex,
      "HSN code must be 4, 6 or 8 digits",
    ),

  unit: z
    .string()
    .min(
      1,
      "Unit is required",
    ),
});

type FormValues = z.infer<
  typeof formSchema
>;

interface ProductFormInitialData {
  id: string;
  version: number;

  sku: string;
  name: string;
  description?: string;

  base_price: number;
  gst_rate: number;

  hsn_code: string;
  unit: string;
}

interface ProductFormProps {
  mode?: "create" | "edit";

  productId?: string;

  initialData?: ProductFormInitialData;
}

export default function ProductForm({
  mode = "create",
  productId,
  initialData,
}: ProductFormProps) {
  const router = useRouter();

  /*
    ===================================
    FE-021 CHANGE:
    Prefill edit values
    ===================================
  */
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
      sku:
        initialData?.sku ||
        "",

      name:
        initialData?.name ||
        "",

      description:
        initialData?.description ||
        "",

      /*
        ===================================
        FE-021 CHANGE:
        paise → rupees
        ===================================
      */
      base_price:
        initialData
          ? initialData.base_price /
            100
          : 0,

      gst_rate:
        String(
          initialData?.gst_rate ||
            "18",
        ) as
          | "0"
          | "5"
          | "12"
          | "18"
          | "28",

      hsn_code:
        initialData?.hsn_code ||
        "",

      unit:
        initialData?.unit ||
        "PCS",
    },
  });

  /*
    ===================================
    FE-021 CHANGE:
    Create + Edit mutation
    ===================================
  */
  const mutation = useMutation({
    mutationFn: async (
      values: FormValues,
    ) => {

      /*
        ===================================
        FE-021 CHANGE:
        rupees → paise
        NEVER float conversion
        ===================================
      */
      const priceInPaise =
        Math.round(
            values.base_price * 100,
        );

      const payload = {
        sku: values.sku,

        name: values.name,

        description:
          values.description?.trim() || undefined,

        base_price:
          priceInPaise,

        gst_rate:
          Number(
            values.gst_rate,
          ),

        hsn_code:
          values.hsn_code,

        unit: values.unit,

        /*
          ===================================
          FE-021 CHANGE:
          optimistic concurrency
          ===================================
        */
        ...(mode === "edit" && {
          version:
            initialData?.version,
        }),
      };

      /*
        ===================================
        FE-021 CHANGE:
        PATCH edit
        ===================================
      */
      if (mode === "edit") {
        const response =
          await api.patch(
            `/products/${productId}`,
            payload,
          );

        return response.data;
      }

      /*
        ===================================
        FE-021 CHANGE:
        POST create
        ===================================
      */
      const response =
        await api.post(
          "/products",
          payload,
        );

      return response.data;
    },

    onSuccess: (
      response,
    ) => {
      toast.success(
        mode === "edit"
          ? "Product updated successfully"
          : "Product created successfully",
      );

      router.push(
        `/products/${response.data.id}`,
      );
    },

    onError: (
        error: AxiosError<{
            error?: {
            message?: string;
            };
        }>,
    ) => {

      /*
        ===================================
        FE-021 CHANGE:
        Version conflict
        ===================================
      */
      if (
        error?.response?.status ===
        409
      ) {
        toast.error(
          "Data changed by another user. Please refresh.",
        );

        router.refresh();

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
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <form
        onSubmit={handleSubmit(
          onSubmit,
        )}
        className="space-y-6"
      >

        {/* ===================================
            Form Grid
        =================================== */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* SKU */}

          <Input
            label="SKU"
            placeholder="PRD-001"
            error={
              errors.sku?.message
            }
            {...register("sku")}
          />

          {/* Product Name */}

          <Input
            label="Product Name"
            placeholder="Enter product name"
            error={
              errors.name?.message
            }
            {...register("name")}
          />

          {/* Base Price */}

          <Input
            type="number"
            label="Base Price (₹)"
            placeholder="1000"
            error={
              errors.base_price
                ?.message
            }
            {...register(
              "base_price",
              {
                setValueAs: (value : string) =>
                    value === ""
                    ? 0
                    : Number(value),
              },
            )}
          />

          {/* GST Rate */}

          <Select
            label="GST Rate"
            value={watch(
              "gst_rate",
            )}
            onValueChange={(
              value : string,
            ) =>
              setValue(
                "gst_rate",
                value as FormValues["gst_rate"],
                {
                    shouldDirty: true,
                    shouldValidate: true,
                },
              )
            }
            options={[
              {
                label: "0%",
                value: "0",
              },
              {
                label: "5%",
                value: "5",
              },
              {
                label: "12%",
                value: "12",
              },
              {
                label: "18%",
                value: "18",
              },
              {
                label: "28%",
                value: "28",
              },
            ]}
          />

          {/* HSN Code */}

          <Input
            label="HSN Code"
            placeholder="8471 / 847130 / 84713010"
            error={
              errors.hsn_code
                ?.message
            }
            {...register(
              "hsn_code",
            )}
          />

          {/* Unit */}

          <Input
            label="Unit"
            placeholder="PCS"
            error={
              errors.unit?.message
            }
            {...register("unit")}
          />
        </div>

        {/* Description */}

        <Input
          label="Description"
          placeholder="Enter product description"
          error={
            errors.description
              ?.message
          }
          {...register(
            "description",
          )}
        />

        {/* ===================================
            Footer Actions
        =================================== */}

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                "/products",
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
                ? "Updating Product..."
                : "Creating Product..."
              : mode ===
                "edit"
              ? "Update Product"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
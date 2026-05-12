// src/components/dealers/DealerAddressForm.tsx

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { DealerAddress } from "@/types/dealer";
import type { AxiosError } from "axios";

const schema = z.object({
  label: z
    .string()
    .min(2, "Label is required"),

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
      "Enter valid mobile number",
    ),

  address_line1: z
    .string()
    .min(
      3,
      "Address line 1 is required",
    ),

  address_line2: z
    .string()
    .optional(),

  city: z
    .string()
    .min(2, "City is required"),

  state: z
    .string()
    .min(2, "State is required"),

  pincode: z
    .string()
    .regex(
      /^[0-9]{6}$/,
      "Pincode must be exactly 6 digits",
    ),

  is_default: z.boolean(),
});

type FormValues = z.infer<
  typeof schema
>;

interface DealerAddressFormProps {
  dealerId: string;

  mode?: "create" | "edit";

  address?: DealerAddress;

  onSuccess?: () => void;

  onCancel?: () => void;
}

export default function DealerAddressForm({
  dealerId,
  mode = "create",
  address,
  onSuccess,
  onCancel,
}: DealerAddressFormProps) {
  /*
    FE-018 CHANGE:
    Support edit mode prefill
  */

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormValues>({
    resolver:
      zodResolver(schema),

    defaultValues: {
      label: "",
      contact_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
      is_default: false,
    },
  });

  /*
    FE-018 CHANGE:
    Prefill edit values
  */
  useEffect(() => {
    if (!address) return;

    reset({
      label:
        address.label || "",

      contact_name:
        address.contact_name ||
        "",

      phone:
        address.phone || "",

      address_line1:
        address.address_line1 ||
        "",

      address_line2:
        address.address_line2 ||
        "",

      city:
        address.city || "",

      state:
        address.state || "",

      pincode:
        address.pincode || "",

      is_default:
        address.is_default ||
        false,
    });
  }, [address, reset]);

  /*
    FE-018 CHANGE:
    Create + Update mutation
  */
  const mutation = useMutation({
    mutationFn: async (
      values: FormValues,
    ) => {
        const payload = {
            label:
                values.label.trim(),

            contact_name:
                values.contact_name.trim(),

            phone:
                values.phone.trim(),

            address_line1:
                values.address_line1.trim(),

            address_line2:
                values.address_line2?.trim() || "",

            city:
                values.city.trim(),

            state:
                values.state.trim(),

            pincode:
                values.pincode.trim(),

            is_default:
                values.is_default,
        };
        if (
            mode === "edit" &&
            !address
            ) {
            throw new Error(
                "Address data missing",
            );
            }
        if (
            mode === "edit" &&
            address
          ) {
            const response =
              await api.patch(
                `/dealers/${dealerId}/addresses/${address.id}`,
                payload,
              );

            return response.data;
          }

        const response =
            await api.post(
            `/dealers/${dealerId}/addresses`,
            payload,
            );

        return response.data;
        },

    onSuccess: () => {
      toast.success(
        mode === "edit"
          ? "Address updated"
          : "Address created",
      );

      onSuccess?.();

      if (mode === "create") {
        reset();
      }
    },

    onError: (
        error: AxiosError<{
            error?: {
                message?: string;
            };
        }>) => {
      if (
        error?.response?.status ===
        409
      ) {
        toast.error(
          "Address label already exists or address is in use.",
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
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <form
        onSubmit={handleSubmit(
          onSubmit,
        )}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="Address Label"
            placeholder="Warehouse"
            error={
              errors.label?.message
            }
            {...register("label")}
          />

          <Input
            label="Contact Name"
            placeholder="John Doe"
            error={
              errors.contact_name
                ?.message
            }
            {...register(
              "contact_name",
            )}
          />

          <Input
            label="Phone"
            placeholder="9876543210"
            error={
              errors.phone?.message
            }
            {...register("phone")}
          />

          <Input
            label="Pincode"
            placeholder="400706"
            error={
              errors.pincode
                ?.message
            }
            {...register("pincode")}
          />

          <Input
            label="City"
            placeholder="Mumbai"
            error={
              errors.city?.message
            }
            {...register("city")}
          />

          <Input
            label="State"
            placeholder="Maharashtra"
            error={
              errors.state?.message
            }
            {...register("state")}
          />
        </div>

        <Input
          label="Address Line 1"
          placeholder="Building / Street"
          error={
            errors.address_line1
              ?.message
          }
          {...register(
            "address_line1",
          )}
        />

        <Input
          label="Address Line 2"
          placeholder="Area / Landmark"
          error={
            errors.address_line2
              ?.message
          }
          {...register(
            "address_line2",
          )}
        />

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <Checkbox
            checked={
                watch("is_default")?? false
            }
            onCheckedChange={(
              checked,
            ) =>
              setValue(
                "is_default",
                Boolean(checked),
                {
                    shouldDirty: true,
                    shouldValidate: true,
                },
              )
            }
            label="Set as default address"
          />

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Setting this as
            default clears
            previous default
            addresses.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              mutation.isPending
            }
          >
            {mutation.isPending
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode ===
                "edit"
              ? "Update Address"
              : "Create Address"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
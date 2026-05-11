// src/components/territories/TerritoryForm.tsx

"use client";

/*
  ===================================
  FE-036
  Territory Form
  ===================================
*/

import {
  useEffect,
} from "react";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  useForm,
} from "react-hook-form";

import {
  z,
} from "zod";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type {
  AxiosError,
} from "axios";

import type { Territory } from "@/types/territory";

const formSchema =
  z.object({
    name: z
      .string()
      .min(
        2,
        "Name is required",
      ),

    adjustment_pct:
        z.coerce
            .number({
            invalid_type_error:
                "Enter valid percentage",
            })
            .min(
            -100,
            "Minimum allowed is -100%",
            )
            .max(
            100,
            "Maximum allowed is 100%",
            ),
  });

type FormValues =
  z.infer<
    typeof formSchema
  >;

interface TerritoryFormProps {
  open: boolean;

  territory:
    | Territory
    | null;

  onClose: () => void;

  onSuccess?: () => void;
}

interface TerritoryMutationResponse {
  success: boolean;

  data?: Territory;
}
const toBasisPoints =
  (
    value: number,
  ) =>
    Math.round(
      value * 100,
    );

export default function TerritoryForm({
  open,
  territory,
  onClose,
  onSuccess,
}: TerritoryFormProps) {
  const isEditMode =
    Boolean(territory);

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
      adjustment_pct: 0,
    },
  });

  /*
    ===================================
    FE-036 CHANGE:
    Populate edit form
    basis_points / 100
    ===================================
  */
  useEffect(() => {
    if (territory) {
      reset({
        name:
          territory.name,

        adjustment_pct:
            toBasisPoints(
                values.adjustment_pct,
            ),
      });
    } else {
      reset({
        name: "",
        adjustment_pct: 0,
      });
    }
  }, [
    territory,
    reset,
  ]);

  /*
    ===================================
    FE-036 CHANGE:
    Create territory
    ===================================
  */
  const createMutation =
    useMutation<
        TerritoryMutationResponse,
        AxiosError,
        FormValues
    >({
      mutationFn: async (
        values: FormValues,
      ) => {
        /*
          ===================================
          FE-036 CHANGE:
          Convert percentage
          to basis points
          ===================================
        */
        return api.post<
            TerritoryMutationResponse
        >(
          "/territories",
          {
            name:
              values.name,

            adjustment_pct:
              Math.round(
                values.adjustment_pct *
                  100,
              ),
          },
        );
      },

      onSuccess: () => {
        onSuccess?.();
      },
    });

  /*
    ===================================
    FE-036 CHANGE:
    Update territory
    ===================================
  */
  const updateMutation =
    useMutation({
      mutationFn: async (
        values: FormValues,
      ) => {
        return api.patch(
          `/territories/${territory?.id}`,
          {
            name:
              values.name,

            /*
              ===================================
              FE-036 CHANGE:
              Convert percentage
              to basis points
              ===================================
            */
            adjustment_pct:
              Math.round(
                values.adjustment_pct *
                  100,
              ),

            /*
              ===================================
              FE-036 CHANGE:
              Version required
              ===================================
            */
            version:
              territory?.version,
          },
        );
      },

      onSuccess: () => {
        onSuccess?.();
      },

      /*
        ===================================
        FE-036 CHANGE:
        Version conflict
        ===================================
      */
      onError: (
        error: any,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.4)] p-4">

      <Card className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">

        {/* ===================================
            Header
        =================================== */}

        <div className="mb-6 flex items-start justify-between">

          <div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)]">

              {isEditMode
                ? "Edit Territory"
                : "Add Territory"}
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Configure
              territory pricing
              adjustment.
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

        {/* ===================================
            Form
        =================================== */}

        <form
          onSubmit={handleSubmit(
            onSubmit,
          )}

          className="space-y-5"
        >
          {/* Name */}

          <Input
            label="Territory Name"

            placeholder="Enter territory name"

            error={
              errors.name
                ?.message
            }

            {...register(
              "name",
            )}
          />

          {/* ===================================
              FE-036 CHANGE:
              Percentage input
              converts to basis points
          =================================== */}

          <Input
            label="Adjustment %"

            type="number"

            step="0.01"

            placeholder="Enter percentage"

            error={
              errors
                .adjustment_pct
                ?.message
            }

            {...register(
              "adjustment_pct",
            )}
          />

          {/* Footer */}

          <div className="flex items-center justify-end gap-3 pt-4">

            <Button
              type="button"

              variant="secondary"

              onClick={
                onClose
              }
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
                  : "Update Territory"
                : createMutation.isPending
                ? "Creating..."
                : "Create Territory"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
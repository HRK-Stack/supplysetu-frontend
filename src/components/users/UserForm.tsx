// src/components/users/UserForm.tsx

"use client";

/*
  ===================================
  FE-035
  User Form
  ===================================
*/

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
import type {
  AxiosError,
} from "axios";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const formSchema =
  z.object({
    name: z
      .string()
      .min(
        2,
        "Name is required",
      ),

    email: z
      .string()
      .email(
        "Enter valid email",
      ),

    phone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter valid mobile number",
      ),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters",
      ),

    role: z.enum([
      "ADMIN",
      "MANAGER",
      "SALES_REP",
    ]),
  });

type FormValues =
  z.infer<
    typeof formSchema
  >;

interface UserFormProps {
  open: boolean;

  onClose: () => void;

  onSuccess?: () => void;
}
interface CreateUserResponse {
  success: boolean;

  data?: {
    id: string;
  };
}
export default function UserForm({
  open,
  onClose,
  onSuccess,
}: UserFormProps) {
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
        email: "",
        phone: "",
        password: "",
        role: "SALES_REP",
    },
  });

  /*
    ===================================
    FE-035 CHANGE:
    Create user
    ===================================
  */
  const createMutation =
    useMutation<
        CreateUserResponse,
        AxiosError,
        FormValues
    >({
      mutationFn: async (
        values: FormValues,
        ) => {
        const response =
            await api.post<CreateUserResponse>(
            "/users",
            values,
            );

        return response.data;
    },

      onSuccess: () => {
        reset();

        onSuccess?.();
    },

      /*
        ===================================
        FE-035 CHANGE:
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
            "Version conflict detected.",
          );
        }
      },
    });

  const onSubmit =
    async (
      values: FormValues,
    ) => {
      await createMutation.mutateAsync(
        values,
      );
    };

  if (!open) {
    return null;
  }

  return (
    <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.4)] p-4"
    >

      <Card className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">

        <div className="mb-6 flex items-start justify-between">

          <div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Invite User
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Create a new
              system user.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
                if (
                    createMutation.isPending
                ) {
                    return;
                }

                reset();

                onClose();
            }}

            className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit(
            onSubmit,
          )}

          className="space-y-5"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <Input
              label="Full Name"

              placeholder="Enter full name"

              error={
                errors
                  .name
                  ?.message
              }

              {...register(
                "name",
              )}
            />

            <Input
              label="Email"

              type="email"

              placeholder="Enter email"

              error={
                errors
                  .email
                  ?.message
              }

              {...register(
                "email",
              )}
            />

            <Input
              label="Phone"

              placeholder="Enter mobile number"

              error={
                errors
                  .phone
                  ?.message
              }

              {...register(
                "phone",
              )}
            />

            <div>

              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Role
              </label>

              <select
                {...register(
                  "role",
                )}

                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--status-info-border)]"
              >
                <option value="">
                  Select Role
                </option>

                <option value="ADMIN">
                  ADMIN
                </option>

                <option value="MANAGER">
                  MANAGER
                </option>

                <option value="SALES_REP">
                  SALES_REP
                </option>
              </select>

              {errors.role && (
                <p className="mt-1 text-xs text-[var(--status-danger-text)]">
                  {
                    errors
                      .role
                      .message
                  }
                </p>
              )}
            </div>
          </div>

          <Input
            label="Password"

            type="password"

            placeholder="Enter password"

            error={
              errors
                .password
                ?.message
            }

            {...register(
              "password",
            )}
          />

          {/* ===================================
              FE-035 CHANGE:
              Password hash never displayed
          =================================== */}

          <div className="flex items-center justify-end gap-3 pt-4">

            <Button
              type="button"

              variant="secondary"

              onClick={() => {
                if (
                    createMutation.isPending
                ) {
                    return;
                }

                reset();

                onClose();
            }}
            >
              Cancel
            </Button>

            <Button
              type="submit"

              disabled={
                createMutation.isPending
            }
            >
              {createMutation.isPending
                ? "Creating..."
                : "Invite User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
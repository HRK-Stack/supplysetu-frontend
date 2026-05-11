// src/components/users/UserTable.tsx

"use client";

/*
  ===================================
  FE-035
  User Table
  ===================================
*/

import {
  useMutation,
} from "@tanstack/react-query";

import {
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

import type {
  AxiosError,
} from "axios";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import type { User } from "@/types/user";
import { formatDate } from "@/lib/date";

interface UserTableProps {
  users: User[];

  page: number;

  totalPages: number;

  onPageChange: (
    page: number,
  ) => void;

  onRefresh?: () => void;
}

interface DeactivateUserResponse {
  success: boolean;
}

export default function UserTable({
  users,
  page,
  totalPages,
  onPageChange,
  onRefresh,
}: UserTableProps) {
  /*
    ===================================
    FE-035 CHANGE:
    Deactivate mutation
    ===================================
  */
  const deactivateMutation =
    useMutation<
        DeactivateUserResponse,
        AxiosError,
        User
    >({
      mutationFn: async (
        user: User,
        ) => {
        const response =
            await api.patch<DeactivateUserResponse>(
            `/users/${user.id}`,
            {
                status:
                "INACTIVE",

                version:
                user.version,
            },
            );

        return response.data;
    },

      onSuccess: () => {
        onRefresh?.();
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
            "Version conflict detected. Please refresh.",
          );
        }
      },
    });

  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">

      {/* ===================================
          Table Header
      =================================== */}

      <div className="border-b border-[var(--border)] bg-[var(--table-header-bg)] px-6 py-5">

        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Users
        </h2>
      </div>

      {/* ===================================
          Table
      =================================== */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-[var(--table-header-bg)]">

            <tr>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Name
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Email
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Role
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Created
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {users.map(
              (user) => (
                <tr
                  key={
                    user.id
                  }

                  className="border-t border-[var(--border-light)] transition-colors hover:bg-[var(--navy-soft)]"
                >
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-info-bg)]">

                        <Shield className="h-5 w-5 text-[var(--status-info-text)]" />
                      </div>

                      <div>

                        <p className="font-medium text-[var(--text-primary)]">
                          {
                            user.name
                          }
                        </p>

                        <p className="text-xs text-[var(--text-secondary)]">
                          {
                            user.phone
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {
                      user.email
                    }
                  </td>

                  <td className="px-6 py-4">

                    <span className="rounded-full bg-[var(--status-info-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-info-text)]">
                      {
                        user.role
                      }
                    </span>
                  </td>

                  <td className="px-6 py-4">

                    {user.status ===
                    "ACTIVE" ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-success-text)]">

                        <UserCheck className="h-3.5 w-3.5" />

                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-danger-text)]">

                        <UserX className="h-3.5 w-3.5" />

                        INACTIVE
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {formatDate(
                        user.created_at,
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">

                    {user.status ===
                      "ACTIVE" && (
                      <Button
                        type="button"
                        size="sm"

                        variant="secondary"

                        disabled={
                            deactivateMutation.isPending &&
                            deactivateMutation.variables?.id ===
                                user.id
                        }

                        onClick={() => {
                          deactivateMutation.mutate(
                            user,
                          );
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ),
            )}
            {users.length === 0 && (
                <tr>
                    <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                    >
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        No Users Found
                    </h3>

                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Try adjusting filters.
                    </p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===================================
          Pagination
      =================================== */}

      <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4">

        <p className="text-sm text-[var(--text-secondary)]">
          Page {page} of {Math.max(totalPages, 1)}
        </p>

        <div className="flex items-center gap-3">

          <Button
            type="button"
            size="sm"

            variant="secondary"

            disabled={
              page <= 1
            }

            onClick={() => {
              onPageChange(
                page - 1,
              );
            }}
          >
            Previous
          </Button>

          <Button
            type="button"
            size="sm"

            disabled={
              page >=
              totalPages
            }

            onClick={() => {
              onPageChange(
                page + 1,
              );
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
// src/app/(dashboard)/settings/users/page.tsx

"use client";

/*
  ===================================
  FE-035
  User Management Page
  ===================================
*/

import {
  useState,
  useEffect,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import { useAuth } from "@/hooks/useAuth";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import UserTable from "@/components/users/UserTable";
import UserForm from "@/components/users/UserForm";

import type { User } from "@/types/user";

interface UserListResponse {
  data: User[];

  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export default function UserManagementPage() {
  const { user } =
    useAuth();

  /*
    ===================================
    FE-035 CHANGE:
    Filter states
    ===================================
  */
  const [
    roleFilter,
    setRoleFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  useEffect(() => {
    setPage(1);
    }, [
    roleFilter,
    statusFilter,
  ]);

  /*
    ===================================
    FE-035 CHANGE:
    Invite modal
    ===================================
  */
  const [
    openInviteModal,
    setOpenInviteModal,
  ] = useState(false);

  /*
    ===================================
    FE-035 CHANGE:
    ADMIN only access
    ===================================
  */
  const isForbidden =
    user?.role !==
    "ADMIN";

  /*
    ===================================
    FE-035 CHANGE:
    Fetch users
    ===================================
  */
  const {
    data,
    isLoading,
    error,
    refetch,
  } =
    useQuery<UserListResponse>({
      queryKey: [
        "users",
        page,
        roleFilter,
        statusFilter,
      ],

      queryFn: async () => {
        const response =
          await api.get<UserListResponse>(
            "/users",
            {
                params: {
                    page,
                    page_size: 10,
                    role:
                        roleFilter ||
                        undefined,
                    status:
                        statusFilter ||
                        undefined,
                    sort_by:
                        "created_at",
                    sort_order:
                        "desc",
                },
            },
        );

        return response.data;
      },

      enabled:
        !isForbidden,
    });

  /*
    ===================================
    FE-035 CHANGE:
    Users list
    ===================================
  */
  const users =
    data?.data ?? [];


  const handleRefresh = () => {
    void refetch();
  };

  /*
    ===================================
    FE-035 CHANGE:
    Access blocked
    ===================================
  */
  if (isForbidden) {
    return (
      <Card className="rounded-2xl border border-[var(--status-danger-border)] bg-[var(--card)] p-8">

        <h2 className="text-2xl font-bold text-[var(--status-danger-text)]">
          Access Denied
        </h2>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Only ADMIN users
          can manage users.
        </p>
      </Card>
    );
  }

  /*
    ===================================
    Loading State
    ===================================
  */
  if (isLoading) {
    return (
      <div className="space-y-6">

        <div className="h-28 animate-pulse rounded-2xl bg-[var(--table-header-bg)]" />

        <div className="min-h-[500px] animate-pulse rounded-2xl bg-[var(--table-header-bg)]" />
      </div>
    );
  }

  /*
    ===================================
    Error State
    ===================================
  */
  if (error) {
    return (
      <Card className="rounded-2xl border border-[var(--status-danger-border)] bg-[var(--card)] p-6">

        <h2 className="text-xl font-semibold text-[var(--status-danger-text)]">
          Failed to load
          users
        </h2>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Unable to fetch
          user list.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            User Management
          </h1>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage system
            users, roles and
            access control.
          </p>
        </div>

        {/* ===================================
            FE-035 CHANGE:
            Invite user
        =================================== */}

        <Button
          type="button"
          onClick={() => {
            setOpenInviteModal(
              true,
            );
          }}
        >
          Invite User
        </Button>
      </div>

      {/* ===================================
          Filters
      =================================== */}

      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* ===================================
              Role Filter
          =================================== */}

          <div>

            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Role
            </label>

            <select
              value={
                roleFilter
              }

              onChange={(
                event,
              ) => {
                setRoleFilter(
                  event
                    .target
                    .value,
                );
              }}

              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--status-info-border)]"
            >
              <option value="">
                All Roles
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
          </div>

          {/* ===================================
              Status Filter
          =================================== */}

          <div>

            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Status
            </label>

            <select
              value={
                statusFilter
              }

              onChange={(
                event,
              ) => {
                setStatusFilter(
                  event
                    .target
                    .value,
                );
              }}

              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--status-info-border)]"
            >
              <option value="">
                All Status
              </option>

              <option value="ACTIVE">
                ACTIVE
              </option>

              <option value="INACTIVE">
                INACTIVE
              </option>
            </select>
          </div>
        </div>
      </Card>

      {/* ===================================
          User Table
      =================================== */}

      <UserTable
        users={users}

        page={
          data?.meta
            ?.page ?? 1
        }

        totalPages={
          data?.meta
            ?.total_pages ??
          1
        }

        onPageChange={(
          nextPage,
        ) => {
          setPage(
            nextPage,
          );
        }}

        /*
          ===================================
          FE-035 CHANGE:
          Refetch after deactivate
          ===================================
        */
        onRefresh={handleRefresh}
      />

      {/* ===================================
          FE-035 CHANGE:
          Invite User Modal
      =================================== */}

      <UserForm
        open={
          openInviteModal
        }

        onClose={() => {
          setOpenInviteModal(
            false,
          );
        }}

        /*
          ===================================
          FE-035 CHANGE:
          Refresh after create
          ===================================
        */
        onSuccess={() => {
            setOpenInviteModal(
                false,
            );

            handleRefresh();
        }}
      />
    </div>
  );
}
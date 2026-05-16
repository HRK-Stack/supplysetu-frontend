// src/app/(dashboard)/schemes/page.tsx

"use client";

/*
  ===================================
  FE-037
  Scheme Management Page
  ===================================
*/

import {
  useEffect,
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import SchemeTable from "@/components/schemes/SchemeTable";
import SchemeForm from "@/components/schemes/SchemeForm";

import type { Scheme } from "@/types/scheme";

interface SchemeResponse {
  data: Scheme[];

  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export default function SchemeManagementPage() {
  const { role } =
    useAuth();

  /*
    ===================================
    FE-037 CHANGE:
    Filters
    ===================================
  */
  const [
    page,
    setPage,
  ] = useState(1);

  const [
    isActive,
    setIsActive,
  ] = useState("");

    useEffect(() => {
        setPage(1);
    }, [
        isActive,
    ]);

  /*
    ===================================
    FE-037 CHANGE:
    Modal state
    ===================================
  */
  const [
    openForm,
    setOpenForm,
  ] = useState(false);

  const [
    selectedScheme,
    setSelectedScheme,
  ] =
    useState<Scheme | null>(
      null,
    );

  /*
    ===================================
    FE-037 CHANGE:
    MANAGER/ADMIN only
    ===================================
  */
  const isForbidden =
    ![
      "ADMIN",
      "MANAGER",
    ].includes(
      role ?? "",
    );

  /*
    ===================================
    FE-037 CHANGE:
    Fetch schemes
    ===================================
  */
  const {
    data,
    isLoading,
    error,
    refetch,
  } =
    useQuery<SchemeResponse>({
      queryKey: [
        "schemes",
        page,
        isActive,
      ],

      queryFn:
        async () => {
          const response =
            await api.get<SchemeResponse>(
                "/schemes",
                {
                params: {
                    page,
                    page_size: 10,
                    is_active:
                    isActive ||
                    undefined,
                },
                },
            );
          return response.data;
        },

      enabled:
        !isForbidden,
    });

    const schemes =
        data?.data ?? [];

    const handleRefresh =
        () => {
            void refetch();
        };

  /*
    ===================================
    Access Denied
    ===================================
  */
  if (isForbidden) {
    return (
      <Card className="rounded-2xl border border-(--status-danger-border) bg-(--card) p-8">

        <h2 className="text-2xl font-bold text-(--status-danger-text)">
          Access Denied
        </h2>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Only ADMIN and
          MANAGER users can
          manage schemes.
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

        <div className="h-28 animate-pulse rounded-2xl bg-(--table-header-bg)" />

        <div className="h-125 animate-pulse rounded-2xl bg-(--table-header-bg)" />
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
      <Card className="rounded-2xl border border-(--status-danger-border) bg-(--card) p-6">

        <h2 className="text-xl font-semibold text-(--status-danger-text)">
          Failed to load
          schemes
        </h2>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Unable to fetch
          scheme data.
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

          <h1 className="text-3xl font-bold text-(--text-primary)">
            Scheme
            Management
          </h1>

          <p className="mt-1 text-sm text-(--text-secondary)">
            Configure pricing
            schemes and
            promotional rules.
          </p>
        </div>

        {/* ===================================
            FE-037 CHANGE:
            Add Scheme
        =================================== */}

        <Button
          type="button"
          onClick={() => {
            setSelectedScheme(
              null,
            );

            setOpenForm(
              true,
            );
          }}
        >
          Add Scheme
        </Button>
      </div>

      {/* ===================================
          Filters
      =================================== */}

      <Card className="rounded-2xl border border-(--border) bg-(--card) p-5">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-1">

          {/* Active Filter */}

          <div>

            <label className="mb-2 block text-sm font-medium text-(--text-primary)">
              Active Status
            </label>

            <select
              value={
                isActive
              }

              onChange={(
                event,
              ) => {
                setIsActive(
                  event
                    .target
                    .value,
                );
              }}

              className="h-11 w-full rounded-xl border border-(--border) bg-(--panel) px-4 text-sm text-(--text-primary) outline-none transition-all focus:border-(--status-info-border)"
            >
              <option value="">
                All Schemes
              </option>

              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>
            </select>
          </div>
        </div>
      </Card>

      {/* ===================================
          Scheme Table
      =================================== */}

      <SchemeTable
        schemes={schemes}

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
          FE-037 CHANGE:
          Edit scheme
          ===================================
        */
        onEdit={(
          scheme,
        ) => {
          setSelectedScheme(
            scheme,
          );

          setOpenForm(
            true,
          );
        }}
      />

      {/* ===================================
          FE-037 CHANGE:
          Scheme Modal
      =================================== */}

      <SchemeForm
        open={openForm}

        scheme={
          selectedScheme
        }

        onClose={() => {
            setOpenForm(
                false,
            );

            setSelectedScheme(
                null,
            );
        }}

        onSuccess={() => {
            setOpenForm(
                false,
            );

            setSelectedScheme(
                null,
            );

            handleRefresh();
        }}
      />
    </div>
  );
}
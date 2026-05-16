// src/app/(dashboard)/settings/territories/page.tsx

"use client";

/*
  ===================================
  FE-036
  Territory Management Page
  ===================================
*/

import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import TerritoryTable from "@/components/territories/TerritoryTable";
import TerritoryForm from "@/components/territories/TerritoryForm";

import type { Territory } from "@/types/territory";

interface TerritoryResponse {
  data: Territory[];
}

export default function TerritoryManagementPage() {
  const { role } =
    useAuth();

  /*
    ===================================
    FE-036 CHANGE:
    Modal state
    ===================================
  */
  const [
    openForm,
    setOpenForm,
  ] = useState(false);

  /*
    ===================================
    FE-036 CHANGE:
    Selected territory
    ===================================
  */
  const [
    selectedTerritory,
    setSelectedTerritory,
  ] =
    useState<
      Territory | null
    >(null);

  /*
    ===================================
    FE-036 CHANGE:
    ADMIN only
    ===================================
  */
  const isForbidden =
    role !==
    "ADMIN";

  /*
    ===================================
    FE-036 CHANGE:
    Fetch territories
    ===================================
  */
  const {
    data,
    isLoading,
    error,
    refetch,
  } =
    useQuery<
        TerritoryResponse
    >(
      {
        queryKey: [
          "territories",
        ],

        queryFn:
          async () => {
            const response =
              await api.get<TerritoryResponse>(
                "/territories",
              );

            return response.data;
          },

        enabled:
          !isForbidden,
      },
    );

  const territories =
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
          Only ADMIN users
          can manage
          territories.
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
          territories
        </h2>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Unable to fetch
          territory data.
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
            Territory
            Management
          </h1>

          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage territory
            pricing adjustment
            rules.
          </p>
        </div>

        {/* ===================================
            FE-036 CHANGE:
            Add territory
        =================================== */}

        <Button
            type="button"
          onClick={() => {
            setSelectedTerritory(
              null,
            );

            setOpenForm(
              true,
            );
          }}
        >
          Add Territory
        </Button>
      </div>

      {/* ===================================
          Territory Table
      =================================== */}

      <TerritoryTable
        territories={
          territories
        }

        /*
          ===================================
          FE-036 CHANGE:
          Edit territory
          ===================================
        */
        onEdit={(
          territory,
        ) => {
          setSelectedTerritory(
            territory,
          );

          setOpenForm(
            true,
          );
        }}
      />

      {/* ===================================
          FE-036 CHANGE:
          Territory Modal
      =================================== */}

      <TerritoryForm
        open={openForm}

        territory={
          selectedTerritory
        }

        onClose={() => {
            setOpenForm(
                false,
            );

            setSelectedTerritory(
                null,
            );
        }}

        onSuccess={() => {
            setOpenForm(
                false,
            );

            setSelectedTerritory(
                null,
            );

            handleRefresh();
        }}
      />
    </div>
  );
}
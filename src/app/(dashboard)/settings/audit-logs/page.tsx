// src/app/(dashboard)/settings/audit-logs/page.tsx

"use client";

/*
  ===================================
  FE-038
  Audit Log Viewer
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

import { Card } from "@/components/ui/Card";

import AuditLogFilters from "@/components/audit/AuditLogFilters";
import AuditLogTable from "@/components/audit/AuditLogTable";

import type { AuditLog } from "@/types/audit";

interface AuditLogResponse {
  data: AuditLog[];

  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export default function AuditLogsPage() {
  const { role } =
    useAuth();

  /*
    ===================================
    FE-038 CHANGE:
    Filters
    ===================================
  */
  const [
    page,
    setPage,
  ] = useState(1);

  const [
    entityType,
    setEntityType,
  ] = useState("");

  const [
    entityId,
    setEntityId,
  ] = useState("");

  const [
    actorUserId,
    setActorUserId,
  ] = useState("");

  const [
    createdFrom,
    setCreatedFrom,
  ] = useState("");

  const [
    createdTo,
    setCreatedTo,
  ] = useState("");


  useEffect(() => {
    setPage(1);
    }, [
    entityType,
    entityId,
    actorUserId,
    createdFrom,
    createdTo,
  ]);

  /*
    ===================================
    FE-038 CHANGE:
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
    FE-038 CHANGE:
    Fetch audit logs
    ===================================
  */
  const {
    data,
    isLoading,
    error,
  } =
    useQuery<
      AuditLogResponse,
      Error
    >({
      queryKey: [
        "audit-logs",
        page,
        entityType,
        entityId,
        actorUserId,
        createdFrom,
        createdTo,
      ],

      queryFn:
        async () => {
            const response =
            await api.get<AuditLogResponse>(
                "/audit-logs",
                {
                params: {
                    page,
                    page_size: 10,

                    entity_type:
                    entityType ||
                    undefined,

                    entity_id:
                    entityId ||
                    undefined,

                    actor_user_id:
                    actorUserId ||
                    undefined,

                    created_at_from:
                    createdFrom ||
                    undefined,

                    created_at_to:
                    createdTo ||
                    undefined,
                },
                },
            );

            return response.data;
        },

      enabled:
        !isForbidden,
    });

  const logs =
    data?.data ?? [];

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
          access audit logs.
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

        <div className="h-150 animate-pulse rounded-2xl bg-(--table-header-bg)" />
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
          audit logs
        </h2>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Unable to fetch
          audit log data.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div>

        <h1 className="text-3xl font-bold text-(--text-primary)">
          Audit Logs
        </h1>

        <p className="mt-1 text-sm text-(--text-secondary)">
          Track entity
          changes, status
          updates and user
          activity.
        </p>
      </div>

      {/* ===================================
          Filters
      =================================== */}

      <AuditLogFilters
        entityType={
          entityType
        }

        entityId={
          entityId
        }

        actorUserId={
          actorUserId
        }

        createdFrom={
          createdFrom
        }

        createdTo={
          createdTo
        }

        onEntityTypeChange={
          setEntityType
        }

        onEntityIdChange={
          setEntityId
        }

        onActorUserIdChange={
          setActorUserId
        }

        onCreatedFromChange={
          setCreatedFrom
        }

        onCreatedToChange={
          setCreatedTo
        }
      />

      {/* ===================================
          Audit Table
      =================================== */}

      {logs.length === 0 ? (
        <Card className="rounded-2xl border border-(--border) bg-(--card) p-10 text-center">

            <h3 className="text-lg font-semibold text-(--text-primary)">
            No Audit Logs Found
            </h3>

            <p className="mt-2 text-sm text-(--text-secondary)">
            Try adjusting filters or date range.
            </p>
        </Card>
        ) : (
        <AuditLogTable
            logs={logs}

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
        />
        )}
    </div>
  );
}
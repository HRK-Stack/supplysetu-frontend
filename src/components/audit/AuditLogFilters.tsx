// src/components/audit/AuditLogFilters.tsx

"use client";

/*
  ===================================
  FE-038
  Audit Log Filters
  ===================================
*/

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface AuditLogFiltersProps {
  entityType: string;

  entityId: string;

  actorUserId: string;

  createdFrom: string;

  createdTo: string;

  onEntityTypeChange: (
    value: string,
  ) => void;

  onEntityIdChange: (
    value: string,
  ) => void;

  onActorUserIdChange: (
    value: string,
  ) => void;

  onCreatedFromChange: (
    value: string,
  ) => void;

  onCreatedToChange: (
    value: string,
  ) => void;
}

export default function AuditLogFilters({
  entityType,
  entityId,
  actorUserId,
  createdFrom,
  createdTo,
  onEntityTypeChange,
  onEntityIdChange,
  onActorUserIdChange,
  onCreatedFromChange,
  onCreatedToChange,
}: AuditLogFiltersProps) {
  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">

        {/* ===================================
            Entity Type
        =================================== */}

        <div>

          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Entity Type
          </label>

          <select
            value={
              entityType
            }

            onChange={(
              event,
            ) => {
              onEntityTypeChange(
                event
                  .target
                  .value,
              );
            }}

            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--status-info-border)]"
          >
            <option value="">
              All Types
            </option>

            <option value="DEALER">
              DEALER
            </option>

            <option value="PRODUCT">
              PRODUCT
            </option>

            <option value="QUOTE">
              QUOTE
            </option>

            <option value="ORDER">
              ORDER
            </option>

            <option value="USER">
              USER
            </option>

            <option value="SCHEME">
              SCHEME
            </option>
          </select>
        </div>

        {/* Entity ID */}

        <Input
          type="text"
          label="Entity ID"

          placeholder="Search entity id"

          value={
            entityId
          }

          onChange={(
            event,
          ) => {
            onEntityIdChange(
              event.target
                .value,
            );
          }}
        />

        {/* Actor User */}

        <Input
          type="text"
          label="Actor User ID"

          placeholder="Search actor id"

          value={
            actorUserId
          }

          onChange={(
            event,
          ) => {
            onActorUserIdChange(
              event.target
                .value,
            );
          }}
        />

        {/* From */}

        <Input
            label="Created From"

            type="date"

            value={
                createdFrom
            }

            max={
                createdTo ||
                undefined
            }

            onChange={(
                event,
            ) => {
                onCreatedFromChange(
                event.target
                    .value,
                );
            }}
        />

        {/* To */}

        <Input
            label="Created To"

            type="date"

            value={
                createdTo
            }

            min={
                createdFrom ||
                undefined
            }

            onChange={(
                event,
            ) => {
                onCreatedToChange(
                event.target
                    .value,
                );
            }}
        />
      </div>
    </Card>
  );
}
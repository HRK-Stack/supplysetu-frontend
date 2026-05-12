// src/components/dealers/DealerFilters.tsx

"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import type { Territory } from "@/types/territory";

interface DealerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  status: string;
  onStatusChange: (value: string) => void;

  territoryId: string;
  onTerritoryChange: (value: string) => void;

  territories: Territory[];
}

export default function DealerFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  territoryId,
  onTerritoryChange,
  territories,
}: DealerFiltersProps) {
  const [localSearch, setLocalSearch] =
    useState(search);

  // ✅ CHANGE:
  // Sync local state if parent search changes externally
  // Prevents stale input state
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // ✅ CHANGE:
  // Debounced search (300ms)
  // Matches TASK-FE-014 requirement
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Input
          label="Search Dealers"
          placeholder="Search by dealer name..."
          value={localSearch}

          // ✅ CHANGE:
          // Explicitly typed event
          // avoids implicit any errors
          onChange={(
            e: ChangeEvent<HTMLInputElement>,
          ) => {
            setLocalSearch(e.target.value);
          }}
        />

        <Select
          label="Status"
          value={status}
          onChange={onStatusChange}
          options={[
            {
              label: "All Statuses",
              value: "",
            },
            {
              label: "ACTIVE",
              value: "ACTIVE",
            },
            {
              label: "INACTIVE",
              value: "INACTIVE",
            },
          ]}
        />

        <Select
          label="Territory"
          value={territoryId}
          onChange={onTerritoryChange}
          options={[
            {
              label: "All Territories",
              value: "",
            },

            // ✅ CHANGE:
            // safer mapping with explicit return object
            ...territories.map(
              (territory) => ({
                label: territory.name,
                value: territory.id,
              }),
            ),
          ]}
        />
      </div>
    </div>
  );
}
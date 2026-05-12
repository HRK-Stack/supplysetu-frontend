"use client";

/*
  ===================================
  FE-019
  Product Filters
  ===================================
*/

import {
  useEffect,
  useState,
} from "react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ProductFiltersProps {
  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  gstRate: string;

  onGstRateChange: (
    value: string,
  ) => void;
}

export default function ProductFilters({
  search,
  onSearchChange,
  gstRate,
  onGstRateChange,
}: ProductFiltersProps) {

  /*
    ===================================
    FE-019 CHANGE:
    300ms debounce search
    ===================================
  */
  const [
    localSearch,
    setLocalSearch,
    ] = useState(search);

    useEffect(() => {
    setLocalSearch(search);
    }, [search]);

    useEffect(() => {
    const timer =
        setTimeout(() => {
        onSearchChange(
            localSearch,
        );
        }, 300);

    return () =>
        clearTimeout(timer);
    }, [
    localSearch,
    onSearchChange,
    ]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* 
          FE-019 CHANGE:
          Search by name or HSN
        */}
        <Input
          label="Search Products"
          placeholder="Search by name or HSN code"
          value={localSearch}
          onChange={(e) =>
            setLocalSearch(
              e.target.value,
            )
          }
        />

        {/* 
          FE-019 CHANGE:
          GST Rate filter
        */}
        <Select
          label="GST Rate"
          value={gstRate}
          onChange={
            onGstRateChange
          }
          options={[
            {
              label:
                "All GST Rates",
              value: "",
            },
            {
              label: "0%",
              value: "0",
            },
            {
              label: "5%",
              value: "5",
            },
            {
              label: "12%",
              value: "12",
            },
            {
              label: "18%",
              value: "18",
            },
            {
              label: "28%",
              value: "28",
            },
          ]}
        />
      </div>
    </div>
  );
}
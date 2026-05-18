"use client";

/*
  ===================================
  FE-022
  Quote Filters
  ===================================
*/

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Dealer } from "@/types/dealer";
import type { User } from "@/types/user";

interface QuoteFiltersProps {
  status: string;

  onStatusChange: (
    value: string,
  ) => void;

  dealerId: string;

  onDealerChange: (
    value: string,
  ) => void;

  salesRepId: string;

  onSalesRepChange: (
    value: string,
  ) => void;

  createdFrom: string;

  onCreatedFromChange: (
    value: string,
  ) => void;

  createdTo: string;

  onCreatedToChange: (
    value: string,
  ) => void;

  canViewSalesRepFilter: boolean;
}

export default function QuoteFilters({
  status,
  onStatusChange,
  dealerId,
  onDealerChange,
  salesRepId,
  onSalesRepChange,
  createdFrom,
  onCreatedFromChange,
  createdTo,
  onCreatedToChange,
  canViewSalesRepFilter,
}: QuoteFiltersProps) {

  /*
    ===================================
    FE-022 CHANGE:
    Dealer dropdown
    ===================================
  */
  const {
    data: dealerData,
  } = useQuery({
    queryKey: [
      "dealer-filter",
    ],

    queryFn: async () => {
      const response =
        await api.get<{
            data: Dealer[];
        }>(
            "/dealers?page=1&page_size=100",
        );

      return response.data;
    },
  });

  /*
    ===================================
    FE-022 CHANGE:
    Sales rep dropdown
    ===================================
  */
  const {
    data: salesRepData,
  } = useQuery({
    queryKey: [
      "sales-reps-filter",
    ],

    enabled:
      canViewSalesRepFilter,

    queryFn: async () => {
      const response =
        await api.get<{
            data: User[];
        }>(
            "/users?role=SALES_REP",
        );

      return response.data;
    },
  });

  const dealers =
    dealerData?.data || [];

  const salesReps =
    salesRepData?.data || [];

  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
            canViewSalesRepFilter
            ? "xl:grid-cols-5"
            : "xl:grid-cols-4"
        }`}
      >
        {/* Status */}
        <Select
          label="Quote Status"
          value={status}
          onChange={
            onStatusChange
          }
          options={[
            {
              label:
                "All Status",
              value: "",
            },
            {
              label: "DRAFT",
              value: "DRAFT",
            },
            {
              label: "SENT",
              value: "SENT",
            },
            {
              label:
                "NEGOTIATION",
              value:
                "NEGOTIATION",
            },
            {
              label:
                "ACCEPTED",
              value:
                "ACCEPTED",
            },
            {
              label:
                "REJECTED",
              value:
                "REJECTED",
            },
            {
              label:
                "CONVERTED_TO_ORDER",
              value:
                "CONVERTED_TO_ORDER",
            },
          ]}
        />

        {/* Dealer */}

        <Select
          label="Dealer"
          value={dealerId}
          onChange={
            onDealerChange
          }
          options={[
            {
              label:
                "All Dealers",
              value: "",
            },

            ...dealers.map(
              (
                dealer: Dealer,
              ) => ({
                label:
                  dealer.name,
                value:
                  dealer.id,
              }),
            ),
          ]}
        />

        {/* ===================================
            FE-022 CHANGE:
            ADMIN/MANAGER only
        =================================== */}

        {canViewSalesRepFilter && (
          <Select
            label="Sales Rep"
            value={
              salesRepId
            }
            onChange={
              onSalesRepChange
            }
            options={[
              {
                label:
                  "All Sales Reps",
                value: "",
              },

              ...salesReps.map(
                (
                  user: User,
                ) => ({
                  label:
                    user.name,
                  value:
                    user.id,
                }),
              ),
            ]}
          />
        )}

        {/* Created From */}

        <Input
          type="date"
          label="Created From"
          value={
            createdFrom
          }
          onChange={(e) =>
            onCreatedFromChange(
              e.target.value,
            )
          }
        />

        {/* Created To */}

        <Input
          type="date"
          label="Created To"
          value={createdTo}
          onChange={(e) =>
            onCreatedToChange(
              e.target.value,
            )
          }
        />
      </div>
    </div>
  );
}

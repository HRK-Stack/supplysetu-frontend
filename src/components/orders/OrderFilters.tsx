// src/components/orders/OrderFilters.tsx

"use client";

/*
  ===================================
  FE-032
  Order Filters
  ===================================
*/

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { Dealer } from "@/types/dealer";

interface OrderFiltersProps {
  status: string;

  onStatusChange: (
    value: string,
  ) => void;

  exportStatus: string;

  onExportStatusChange: (
    value: string,
  ) => void;

  dealerId: string;

  onDealerChange: (
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
}

interface DealerListResponse {
  data: Dealer[];
}

export default function OrderFilters({
  status,
  onStatusChange,

  exportStatus,
  onExportStatusChange,

  dealerId,
  onDealerChange,

  createdFrom,
  onCreatedFromChange,

  createdTo,
  onCreatedToChange,
}: OrderFiltersProps) {

  /*
    ===================================
    FE-032 CHANGE:
    Dealer dropdown
    ===================================
  */
  const { data } =
  useQuery<DealerListResponse>({
    queryKey: [
      "dealer-options",
    ],

    queryFn: async () => {
      const response =
        await api.get<DealerListResponse>(
          "/dealers",
          {
            params: {
              page_size: 100,
            },
          },
        );

      return response.data;
    },
  });

  const dealers: Dealer[] =
    data?.data ?? [];

  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        {/* ===================================
            Status
        =================================== */}

        <div>

          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Order Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              onStatusChange(
                e.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)] outline-none"
          >
            <option value="">
              All Status
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        {/* ===================================
            Export Status
        =================================== */}

        <div>

          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Export Status
          </label>

          <select
            value={
              exportStatus
            }
            onChange={(e) =>
              onExportStatusChange(
                e.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)] outline-none"
          >
            <option value="">
              All Export
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="EXPORTED">
              Exported
            </option>

            <option value="FAILED">
              Failed
            </option>
          </select>
        </div>

        {/* ===================================
            Dealer
        =================================== */}

        <div>

          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Dealer
          </label>

          <select
            value={dealerId}
            onChange={(e) =>
              onDealerChange(
                e.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)] outline-none"
          >
            <option value="">
              All Dealers
            </option>

            {dealers.map(
              (
                dealer,
              ) => (
                <option
                  key={
                    dealer.id
                  }
                  value={
                    dealer.id
                  }
                >
                  {
                    dealer.name
                  }
                </option>
              ),
            )}
          </select>
        </div>

        {/* ===================================
            Created From
        =================================== */}

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

        {/* ===================================
            Created To
        =================================== */}

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
    </Card>
  );
}
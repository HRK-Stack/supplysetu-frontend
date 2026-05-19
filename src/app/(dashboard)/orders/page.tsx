// src/app/(dashboard)/orders/page.tsx

"use client";

/*
  ===================================
  FE-032
  Order List Page
  ===================================
*/

import { useState } from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import OrderFilters from "@/components/orders/OrderFilters";
import OrderTable from "@/components/orders/OrderTable";

import { useAuth } from "@/hooks/useAuth";

import type {
  Order,
} from "@/types/order";

import type { PaginatedResponse }
  from "@/types/common";

export default function OrdersPage() {
  const router =
    useRouter();

  const { role } =
    useAuth();

  /*
    ===================================
    FE-032 CHANGE:
    Filters
    ===================================
  */
  const [page, setPage] =
    useState(1);

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    exportStatus,
    setExportStatus,
  ] = useState("");

  const [
    dealerId,
    setDealerId,
  ] = useState("");

  const [
    createdFrom,
    setCreatedFrom,
  ] = useState("");

  const [
    createdTo,
    setCreatedTo,
  ] = useState("");

  /*
    ===================================
    FE-032 CHANGE:
    Orders query
    ===================================
  */
  const {
    data,
    isLoading,
  } = useQuery<
    PaginatedResponse<Order>
    >({
    queryKey: [
      "orders",
      page,
      status,
      exportStatus,
      dealerId,
      createdFrom,
      createdTo,
    ],

    queryFn: async () => {
      const response =
        await api.get(
          "/orders",
          {
            params: {
              page,

              page_size: 10,

              status:
                status ||
                undefined,

              export_status:
                exportStatus ||
                undefined,

              dealer_id:
                dealerId ||
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
  });

  const orders =
    data?.success
      ? data.data
      : [];

  const meta =
    data?.success
      ? data.meta
      : null;

  return (
    <div className="space-y-6">

      {/* ===================================
          Header
      =================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-(--text-primary)">

            Orders
          </h1>

          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage orders,
            export status and
            dealer fulfilment.
          </p>
        </div>

        {/* ===================================
            FE-032 CHANGE:
            Admin actions
        =================================== */}

        {(
          role === "ADMIN" ||
          role === "MANAGER"
        ) && (
          <Button
            onClick={() => {
              router.push(
                "/orders/export",
              );
            }}
          >
            Export Orders
          </Button>
        )}
      </div>

      {/* ===================================
          Filters
      =================================== */}

      <OrderFilters
        status={status}
        onStatusChange={
          setStatus
        }

        exportStatus={
          exportStatus
        }

        onExportStatusChange={
          setExportStatus
        }

        dealerId={
          dealerId
        }

        onDealerChange={
          setDealerId
        }

        createdFrom={
          createdFrom
        }

        onCreatedFromChange={
          setCreatedFrom
        }

        createdTo={
          createdTo
        }

        onCreatedToChange={
          setCreatedTo
        }
      />

      {/* ===================================
          Table
      =================================== */}

      <OrderTable
        orders={orders}

        isLoading={
          isLoading
        }

        /*
          ===================================
          FE-032 CHANGE:
          Navigate detail page
          ===================================
        */
        onRowClick={(
          orderId: string,
        ) => {
          router.push(
            `/orders/${orderId}`,
          );
        }}
      />

      {/* ===================================
          Pagination
      =================================== */}

      {meta && (
        <Card className="flex flex-col gap-4 rounded-2xl border border-(--border) bg-(--card) p-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="text-sm text-(--text-secondary)">

            Showing page{" "}
            <span className="font-semibold text-(--text-primary)">
              {meta.page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-(--text-primary)">
              {meta.total_pages}
            </span>
          </div>

          <div className="flex items-center gap-3">

            <Button
              variant="secondary"
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  (
                    prev,
                  ) =>
                    prev - 1,
                )
              }
            >
              Previous
            </Button>

            <Button
              disabled={
                page >=
                meta.total_pages
              }
              onClick={() =>
                setPage(
                  (
                    prev,
                  ) =>
                    prev + 1,
                )
              }
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
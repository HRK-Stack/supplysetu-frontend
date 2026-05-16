// src/app/(dashboard)/orders/[id]/page.tsx

"use client";

/*
  ===================================
  FE-033 + FE-034
  Order Detail Page
  ===================================
*/

import {
  useParams,
} from "next/navigation";

import {
  useQuery,
} from "@tanstack/react-query";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";

import OrderHeader from "@/components/orders/OrderHeader";

/*
  ===================================
  FE-034 CHANGE:
  Added export trigger
  ===================================
*/
import ExportTrigger from "@/components/orders/ExportTrigger";

import OrderItemList from "@/components/orders/OrderItemList";
import type { Order } from "@/types/order";

interface OrderDetailResponse {
  data: Order;
}

export default function OrderDetailPage() {
  const params = useParams();

  const orderId =
    typeof params?.id ===
    "string"
      ? params.id
      : "";

  /*
    ===================================
    FE-033 CHANGE:
    Fetch order detail
    ===================================
  */
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<OrderDetailResponse>({
    enabled:
      Boolean(orderId),

    queryKey: [
      "order-detail",
      orderId,
    ],

    queryFn: async () => {
      const response =
        await api.get<OrderDetailResponse>(
          `/orders/${orderId}`,
        );

      return response.data;
    },
  });

  const order =
    data?.data;

  /*
    ===================================
    Loading State
    ===================================
  */
  if (isLoading) {
    return (
      <div className="space-y-6">

        <div className="h-40 animate-pulse rounded-2xl bg-(--table-header-bg)" />

        <div className="h-125 animate-pulse rounded-2xl bg-(--table-header-bg)" />
      </div>
    );
  }

  /*
    ===================================
    Error State
    ===================================
  */
  if (error || !order) {
    return (
      <Card className="rounded-2xl border border-(--status-danger-border) bg-(--card) p-6">

        <h2 className="text-xl font-semibold text-(--status-danger-text)">
          Failed to load
          order
        </h2>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Unable to fetch
          order details.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================
          Order Header
      =================================== */}

      <OrderHeader
        order={order}
        onRefresh={() => {
          void refetch();
        }}
      />

      {/* ===================================
          FE-034 CHANGE:
          Tally Export Trigger
      =================================== */}

      <ExportTrigger
        orderId={order.id}

        exportStatus={
          order.export_status
        }

        /*
          ===================================
          FE-034 CHANGE:
          Refresh order data
          after export updates
          ===================================
        */
        onRefresh={() => {
          void refetch();
        }}
      />

      {/* ===================================
          Order Items
      =================================== */}

      <OrderItemList
        items={
          order.items ?? []
        }
      />
    </div>
  );
}
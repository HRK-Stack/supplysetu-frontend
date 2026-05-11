// src/components/orders/OrderConverter.tsx

"use client";

/*
  ===================================
  FE-031
  Quote To Order Conversion
  ===================================
*/

import { useMemo, useState } from "react";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  ArrowRightLeft,
} from "lucide-react";

import { useRouter } from "next/navigation";

import api from "@/lib/api";

import { Button } from "@/components/ui/Button";

import CreditCheckModal from "@/components/orders/CreditCheckModal";

import { useAuth } from "@/hooks/useAuth";
import type {
  Quote,
  QuoteItem,
} from "@/types/quote";
import { AxiosError } from "axios";
    

interface OrderConverterProps {
  quote: Quote;

  onRefresh?: () => void;
}

export default function OrderConverter({
  quote,
  onRefresh,
}: OrderConverterProps) {
  const router =
    useRouter();

  const { user } = useAuth();

  /*
    ===================================
    FE-031 CHANGE:
    Modal state
    ===================================
  */
  const [open, setOpen] =
    useState(false);

  /*
    ===================================
    FE-031 CHANGE:
    Order total from
    pricing snapshot
    NO recalculation
    ===================================
  */
  const orderTotal =
    useMemo(() => {
      return (
        quote.current_revision?.items?.reduce(
          (
            total: number,
            item: QuoteItem,
          ) =>
            total +
            item.line_total,
          0,
        ) || 0
      );
    }, [quote]);

  /*
    ===================================
    FE-031 CHANGE:
    Credit values
    ===================================
  */
  const creditLimit =
    quote.dealer_credit_limit ||
    0;

  const outstandingBalance =
    quote.dealer_outstanding_balance ||
    0;

  const availableCredit =
    creditLimit -
    outstandingBalance;

  /*
    ===================================
    FE-031 CHANGE:
    Convert order
    ===================================
  */
  const convertMutation =
    useMutation({
      mutationFn:
        async () => {
          const response =
            await api.post(
              "/orders",
              {
                /*
                  ===================================
                  FE-031 CHANGE:
                  Required payload
                  ===================================
                */
                quote_id:
                  quote.id,

                quote_version:
                  quote.version,
              },
            );

          return response.data;
        },

      /*
        ===================================
        FE-031 CHANGE:
        Success redirect
        ===================================
      */
      onSuccess: (
        response,
      ) => {
        setOpen(false);

        const orderId =
          response?.data
            ?.id;

        if (orderId) {
          router.push(
            `/orders/${orderId}`,
          );
        }
      },

      /*
        ===================================
        FE-031 CHANGE:
        Error handling
        ===================================
      */
      onError: (
        error: AxiosError<{
            code?: string;
            order_id?: string;
            existing_order_id?: string;
        }>,
        ) => {
        const status =
          error?.response
            ?.status;

        const code =
          error?.response
            ?.data?.code;

        /*
          NEVER auto retry
        */
        /*
          ===================================
          QUOTE_EXPIRED
          ===================================
        */
        if (
          code ===
          "QUOTE_EXPIRED"
        ) {
          alert(
            "Quote expired. Create revision to proceed.",
          );
        }

        /*
          ===================================
          CREDIT_LIMIT_EXCEEDED
          ===================================
        */
        if (
          code ===
          "CREDIT_LIMIT_EXCEEDED"
        ) {
          alert(
            "Credit limit exceeded.",
          );
        }

        /*
          ===================================
          ALREADY_CONVERTED
          ===================================
        */
        if (
          code ===
          "QUOTE_ALREADY_CONVERTED"
        ) {
          const orderId =
            error?.response
              ?.data
              ?.order_id;

          if (orderId) {
            router.push(
              `/orders/${orderId}`,
            );
          }
        }

        /*
          ===================================
          VERSION CONFLICT
          ===================================
        */
        if (
          status ===
          409
        ) {
          alert(
            "Quote updated by another user. Please refresh.",
          );

          onRefresh?.();
        }
      },
    });

  /*
    ===================================
    FE-031 CHANGE:
    ACCEPTED only
    ===================================
  */
  const canConvert =
    quote.status ===
    "ACCEPTED";

  if (!canConvert) {
    return null;
  }

  return (
    <>
      {/* ===================================
          Convert Button
      =================================== */}

      <Button
        type="button"
        onClick={() =>
          setOpen(true)
        }
      >
        <ArrowRightLeft className="h-4 w-4" />

        Convert To Order
      </Button>

      {/* ===================================
          Credit Check Modal
      =================================== */}

      <CreditCheckModal
        open={open}
        onClose={() =>
          setOpen(false)
        }

        onConfirm={() =>
          convertMutation.mutate()
        }

        isSubmitting={
          convertMutation.isPending
        }

        role={user?.role}

        orderTotal={
          orderTotal
        }

        creditLimit={
          creditLimit
        }

        outstandingBalance={
          outstandingBalance
        }

        availableCredit={
          availableCredit
        }
      />
    </>
  );
}
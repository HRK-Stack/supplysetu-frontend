"use client";

/*
  ===================================
  FE-023
  Dealer Selector
  ===================================
*/

import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Building2,
  CreditCard,
  MapPin,
  Search,
} from "lucide-react";

import api from "@/lib/api";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import { formatPaise } from "@/lib/format";
import type { Dealer } from "@/types/dealer";
import type { DealerAddress } from "@/types/dealer";

interface DealerSelectorProps {
  dealerId: string | null;

  onDealerChange: (
    dealerId: string,
  ) => void;

  shipToAddressId:
    | string
    | null;

  onShipToAddressChange: (
    addressId:
      | string
      | null,
  ) => void;

  validDays: number;

  onValidDaysChange: (
    days: number,
  ) => void;
}

export default function DealerSelector({
  dealerId,
  onDealerChange,
  shipToAddressId,
  onShipToAddressChange,
  validDays,
  onValidDaysChange,
}: DealerSelectorProps) {

  /*
    ===================================
    FE-023 CHANGE:
    Search state
    ===================================
  */
  const [search, setSearch] =
    useState("");

  /*
    ===================================
    FE-023 CHANGE:
    ACTIVE dealers only
    ===================================
  */
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: [
      "active-dealers",
      search,
    ],

    queryFn: async () => {
     const response =
        await api.get<{
            data: Dealer[];
        }>(
            `/dealers?status=ACTIVE&search=${search}&page=1&page_size=100`,
        );

      return response.data;
    },
  });

  const dealers: Dealer[] =
    data?.data ?? [];

  /*
    ===================================
    FE-023 CHANGE:
    Selected dealer object
    ===================================
  */

  /*
    ===================================
    FE-023 CHANGE:
    Dealer addresses
    ===================================
  */
  const {
    data: addressData,
    isLoading:
      addressLoading,
  } = useQuery({
    queryKey: [
      "dealer-addresses",
      dealerId,
    ],

    enabled:
      Boolean(dealerId),

    queryFn: async () => {
      const response =
        await api.get<{
            data: DealerAddress[];
        }>(
            `/dealers/${dealerId}/addresses`,
        );

      return response.data;
    },
  });

  const addresses: DealerAddress[] =
    addressData?.data ?? [];

  return (
    <div className="space-y-6">

      {/* ===================================
          Dealer Search
      =================================== */}

      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">

        <div className="mb-5">
          <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
            Dealer Selection
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Select an active
            dealer and optional
            shipping address.
          </p>
        </div>

        {/* ===================================
            Search Input
        =================================== */}

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />

          <Input
            placeholder="Search dealer by name or GSTIN"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            className="pl-11"
          />
        </div>

        {/* ===================================
            Dealer List
        =================================== */}

        <div className="mt-5 max-h-[340px] space-y-3 overflow-y-auto">

          {/* Loading */}

          {isLoading &&
            Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl bg-[var(--table-header-bg)]"
                />
              ),
            )}

          {/* Empty */}

          {!isLoading &&
            dealers.length ===
              0 && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] py-12 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  No active
                  dealers found.
                </p>
              </div>
            )}

          {/* Dealer Cards */}

          {dealers.map(
            (dealer: Dealer) => {
              const isSelected =
                dealer.id ===
                dealerId;

              return (
                <button
                  key={dealer.id}
                  type="button"

                  /*
                    ===================================
                    FE-023 CHANGE:
                    Dealer selection
                    ===================================
                  */
                  onClick={() => {
                    onDealerChange(
                      dealer.id,
                    );

                    /*
                      Reset ship-to
                    */
                    onShipToAddressChange(
                      null,
                    );
                  }}

                  className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-[var(--navy)] bg-[var(--table-header-bg)] shadow-md"
                      : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--navy-soft)] hover:shadow-sm"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* Left */}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[var(--navy)]" />

                        <h3 className="font-semibold text-[var(--text-primary)]">
                          {
                            dealer.name
                          }
                        </h3>
                      </div>

                      <p className="font-mono text-sm text-[var(--text-secondary)]">
                        {
                          dealer.gstin
                        }
                      </p>
                    </div>

                    {/* Right */}

                    <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2">

                      {/* Credit Limit */}

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
                        <div className="mb-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <CreditCard className="h-3.5 w-3.5" />
                          Credit Limit
                        </div>

                        <p className="font-semibold text-[var(--text-primary)]">
                          {formatPaise(
                            dealer.credit_limit,
                          )}
                        </p>
                      </div>

                      {/* Outstanding */}

                      <div className="rounded-xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-4 py-3">
                        <div className="mb-1 text-xs text-[var(--status-danger-text)]">
                          Outstanding
                        </div>

                        <p className="font-semibold text-[var(--status-danger-text)]">
                          {formatPaise(
                            dealer.outstanding_balance,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            },
          )}
        </div>
      </Card>

      {/* ===================================
          Ship-To Address
      =================================== */}

      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
            Ship-To Address
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Optional shipping
            destination for this
            quote.
          </p>
        </div>

        {/* ===================================
            Address Select
        =================================== */}

        <Select
          label="Dealer Address"
          value={
            shipToAddressId ||
            ""
          }
          onChange={(
            value,
          ) =>
            onShipToAddressChange(
              value || null,
            )
          }
          disabled={!dealerId}
          options={[
            {
              label:
                "No Ship-To Address",
              value: "",
            },

            ...addresses.map(
              (
                address: DealerAddress,
              ) => ({
                label: `${address.label} • ${address.city}`,
                value:
                  address.id,
              }),
            ),
          ]}
        />

        {/* ===================================
            Address Preview
        =================================== */}

        {shipToAddressId && (
          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            {addresses
              .filter(
                (
                  address: DealerAddress,
                ) =>
                  address.id ===
                  shipToAddressId,
              )
              .map(
                (
                  address: DealerAddress,
                ) => (
                  <div
                    key={
                      address.id
                    }
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--navy)]" />

                      <h3 className="font-medium text-[var(--text-primary)]">
                        {
                          address.label
                        }
                      </h3>
                    </div>

                    <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      <p>
                        {
                          address.address_line1
                        }
                      </p>

                      {address.address_line2 && (
                        <p>
                          {
                            address.address_line2
                          }
                        </p>
                      )}

                      <p>
                        {
                          address.city
                        }
                        ,{" "}
                        {
                          address.state
                        }{" "}
                        -{" "}
                        {
                          address.pincode
                        }
                      </p>
                    </div>
                  </div>
                ),
              )}
          </div>
        )}

        {/* ===================================
            Address Loading
        =================================== */}

        {addressLoading && (
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-[var(--table-header-bg)]" />
        )}
      </Card>

      {/* ===================================
          Quote Validity
      =================================== */}

      <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
            Quote Validity
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Define quote
            expiration period.
          </p>
        </div>

        <Input
          type="number"
          label="Valid Days"
          min={1}
          max={365}
          value={validDays}

          /*
            ===================================
            FE-023 CHANGE:
            Max 365 days
            ===================================
          */
          onChange={(e) => {
            if (e.target.value === "") {
                return;
            }

            const value = Number(
                e.target.value,
            );

            if (!Number.isNaN(value)) {
                onValidDaysChange(
                Math.min(
                    365,
                    Math.max(1, value),
                ),
                );
            }
        }}
        />

        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Maximum allowed
          validity is 365
          days.
        </p>
      </Card>
    </div>
  );
}
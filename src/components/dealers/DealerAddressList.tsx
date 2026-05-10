// src/components/dealers/DealerAddressList.tsx

"use client";

import {
  Home,
  MapPin,
  Phone,
} from "lucide-react";

import { Card } from "@/components/ui/Card";

import { useDealerAddresses } from "@/hooks/useDealers";

// ✅ CHANGE:
// Removed `any` usage
// matches TypeScript frontend rules
interface DealerAddress {
  id: string;

  label?: string | null;

  address_line_1?: string | null;
  address_line_2?: string | null;

  city?: string | null;
  state?: string | null;

  postal_code?: string | null;

  phone?: string | null;

  is_default?: boolean;
}

interface DealerAddressListProps {
  dealerId: string;
}

export default function DealerAddressList({
  dealerId,
}: DealerAddressListProps) {
  const {
    addresses,
    isLoading,
    error,
  } = useDealerAddresses(dealerId);

  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      {/* ✅ CHANGE:
          standardized CSS variable
          --border-color → --border */}

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-main)]">
          <Home className="h-5 w-5 text-[var(--text-primary)]" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Ship-To Addresses
          </h2>

          <p className="text-sm text-[var(--text-secondary)]">
            Dealer delivery
            destinations
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-[var(--bg-main)]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
          Failed to load addresses.
        </div>
      ) : (addresses?.length ?? 0) ===
        0 ? (
        // ✅ CHANGE:
        // safer optional chaining
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
          {/* ✅ CHANGE:
              standardized CSS variable */}

          <p className="text-sm text-[var(--text-secondary)]">
            No addresses available
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(addresses as DealerAddress[]).map(
            (
              address,
            ) => (
              <div
                key={address.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] p-5"
              >
                {/* ✅ CHANGE:
                    standardized CSS variable */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />

                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {address.label ||
                          "Address"}
                      </h3>

                      {address.is_default && (
                        <span className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-xs font-medium text-[var(--primary)]">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                      {/* ✅ CHANGE:
                          nullable-safe rendering */}

                      {address.address_line_1 ||
                        "-"}

                      {address.address_line_2 &&
                        `, ${address.address_line_2}`}

                      {address.city &&
                        `, ${address.city}`}

                      {address.state &&
                        `, ${address.state}`}

                      {address.postal_code &&
                        ` - ${address.postal_code}`}
                    </p>
                  </div>

                  {address.phone && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Phone className="h-4 w-4" />

                      {address.phone}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </Card>
  );
}
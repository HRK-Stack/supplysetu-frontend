// src/components/dealers/DealerAddressCard.tsx

"use client";

import { MapPin, Phone, User, Pencil, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { DealerAddress } from "@/types/dealer";

interface DealerAddressCardProps {
  address: DealerAddress;

  canManage: boolean;

  onEdit: () => void;

  onDelete: () => void;
}

export default function DealerAddressCard({
  address,
  canManage,
  onEdit,
  onDelete,
}: DealerAddressCardProps) {
  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {address.label}
            </h3>

            {address.is_default && (
              <span className="rounded-full border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-2.5 py-1 text-xs font-medium text-[var(--status-success-text)]">
                Default
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />

              <span>{address.contact_name || "-"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />

              <span>{address.phone}</span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4" />

              <div className="min-w-0 break-words leading-relaxed">
                <p>{address.address_line1}</p>

                {address.address_line2 && <p>{address.address_line2}</p>}

                <p>
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              aria-label="Edit address"
              variant="secondary"
              size="sm"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button 
              aria-label="Delete address"
              variant="danger" 
              size="sm" 
              onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

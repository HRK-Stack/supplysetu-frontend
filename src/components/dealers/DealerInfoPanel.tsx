// src/components/dealers/DealerInfoPanel.tsx


"use client";

import type { ReactNode } from "react";
// ✅ CHANGE:
// Explicit ReactNode import
// avoids "Cannot find namespace React"

import {
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { Card } from "@/components/ui/Card";

import { formatPaise } from "@/lib/money";

interface DealerInfoPanelProps {
  dealer: {
    id: string;
    name: string;

    // ✅ CHANGE:
    // nullable-safe typing
    // API fields may be optional/null
    contact_name?: string | null;
    phone?: string | null;
    email?: string | null;
    gstin?: string | null;

    address?: string | null;
    territory_name?: string | null;

    discount_pct?: number | null;
    credit_limit?: number | null;
    outstanding_balance?: number | null;

    status: string;

    gstin_verified?: boolean;
  };
}

export default function DealerInfoPanel({
  dealer,
}: DealerInfoPanelProps) {
  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      {/* ✅ CHANGE:
          standardized CSS variable
          --border-color → --border */}

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-main)]">
          <Building2 className="h-5 w-5 text-[var(--text-primary)]" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Dealer Information
          </h2>

          <p className="text-sm text-[var(--text-secondary)]">
            Business profile and
            account details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <InfoItem
          icon={
            <Building2 className="h-4 w-4" />
          }
          label="Dealer Name"
          value={dealer.name}
        />

        <InfoItem
          icon={<User className="h-4 w-4" />}
          label="Contact Name"
          value={dealer.contact_name || "-"}
        />

        <InfoItem
          icon={<Phone className="h-4 w-4" />}
          label="Phone"
          value={dealer.phone || "-"}
        />

        <InfoItem
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={dealer.email || "-"}
        />

        {/* GSTIN Block */}
        <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-4">
          {/* ✅ CHANGE:
              standardized CSS variable */}

          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <ShieldCheck className="h-4 w-4" />
            GSTIN
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="font-medium text-[var(--text-primary)]">
              {dealer.gstin || "-"}
            </p>

            {dealer.gstin_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            ) : (
              <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                Pending
              </span>
            )}
          </div>
        </div>

        <InfoItem
          icon={
            <MapPin className="h-4 w-4" />
          }
          label="Territory"
          value={
            dealer.territory_name || "-"
          }
        />

        <InfoItem
          label="Dealer Discount"
          value={
            // ✅ CHANGE:
            // removed /100
            // backend percentage storage
            // not confirmed as basis points
            `${(
              dealer.discount_pct ?? 0
            ).toFixed(2)}%`
          }
        />

        <InfoItem
          label="Credit Limit"
          value={formatPaise(
            dealer.credit_limit ?? 0,
          )}
        />

        <InfoItem
          label="Outstanding Balance"
          value={formatPaise(
            dealer.outstanding_balance ??
              0,
          )}
          valueClassName="text-red-500"
        />

        <InfoItem
          label="Status"
          value={dealer.status}
        />

        <div className="md:col-span-2">
          <InfoItem
            icon={
              <MapPin className="h-4 w-4" />
            }
            label="Primary Address"
            value={dealer.address || "-"}
          />
        </div>
      </div>
    </Card>
  );
}

interface InfoItemProps {
  label: string;
  value: string;

  // ✅ CHANGE:
  // ReactNode imported directly
  icon?: ReactNode;

  valueClassName?: string;
}

function InfoItem({
  label,
  value,
  icon,
  valueClassName,
}: InfoItemProps) {
  return (
    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-4">
      {/* ✅ CHANGE:
          standardized CSS variable */}

      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        {icon}
        {label}
      </div>

      <p
        className={`break-words font-medium text-[var(--text-primary)] ${
          valueClassName || ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
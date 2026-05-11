// src/components/orders/CreditCheckModal.tsx

"use client";

/*
  ===================================
  FE-031
  Credit Check Modal
  ===================================
*/

import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { formatPaise } from "@/lib/money";

interface CreditCheckModalProps {
  open: boolean;

  onClose: () => void;

  onConfirm: () => void;

  isSubmitting?: boolean;

  role?: string;

  orderTotal: number;

  creditLimit: number;

  outstandingBalance: number;

  availableCredit: number;
}

export default function CreditCheckModal({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  role,
  orderTotal,
  creditLimit,
  outstandingBalance,
  availableCredit,
}: CreditCheckModalProps) {

  /*
    ===================================
    FE-031 CHANGE:
    Cash-only dealer
    ===================================
  */
  const isCashDealer =
    creditLimit === 0;

  /*
    ===================================
    FE-031 CHANGE:
    Credit validation
    ===================================
  */
  const exceedsCredit =
    orderTotal >
    availableCredit;

  /*
    ===================================
    FE-031 CHANGE:
    ADMIN override
    ===================================
  */
  const isAdmin =
    role === "ADMIN";

  /*
    ===================================
    FE-031 CHANGE:
    Block conversion
    ===================================
  */
  const isBlocked =
    exceedsCredit &&
    !isAdmin &&
    !isCashDealer;

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[rgba(15,23,42,0.4)] p-4">

      <div className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-xl)]">

        {/* ===================================
            Header
        =================================== */}

        <div className="border-b border-[var(--table-border)] p-6">

          <h2 className="font-[var(--font-heading)] text-2xl font-semibold text-[var(--text-primary)]">
            Convert Quote To
            Order
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Review dealer
            credit details
            before order
            creation.
          </p>
        </div>

        {/* ===================================
            Body
        =================================== */}

        <div className="space-y-6 p-6">

          {/* ===================================
              Order Total
          =================================== */}

          <Card className="rounded-2xl border border-[var(--status-info-border)] bg-[var(--status-info-bg)] p-6">

            <p className="text-sm text-[var(--status-info-text)]">
              Order Total
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[var(--status-info-text)]">

              {formatPaise(
                orderTotal,
              )}
            </h2>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Computed from
              pricing snapshot.
            </p>
          </Card>

          {/* ===================================
              Credit Details
          =================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Credit Limit */}

            <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

              <p className="text-sm text-[var(--text-muted)]">
                Credit Limit
              </p>

              <h3 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">

                {formatPaise(
                  creditLimit,
                )}
              </h3>
            </Card>

            {/* Outstanding */}

            <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

              <p className="text-sm text-[var(--text-muted)]">
                Outstanding
                Balance
              </p>

              <h3 className="mt-2 text-2xl font-bold text-[var(--status-danger-text)]">

                {formatPaise(
                  outstandingBalance,
                )}
              </h3>
            </Card>

            {/* Available */}

            <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

              <p className="text-sm text-[var(--text-muted)]">
                Available
                Credit
              </p>

              <h3 className="mt-2 text-2xl font-bold text-[var(--status-success-text)]">

                {formatPaise(
                  availableCredit,
                )}
              </h3>
            </Card>
          </div>

          {/* ===================================
              Credit Status
          =================================== */}

          {isCashDealer ? (
            <div className="flex items-start gap-4 rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-5">

              <ShieldAlert className="mt-0.5 h-6 w-6 text-[var(--status-warning-text)]" />

              <div>
                <h3 className="font-semibold text-[var(--status-warning-text)]">
                  Cash-Only Dealer
                </h3>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  No credit check
                  required for this
                  dealer.
                </p>
              </div>
            </div>
          ) : exceedsCredit ? (
            <div className="flex items-start gap-4 rounded-2xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] p-5">

              <AlertTriangle className="mt-0.5 h-6 w-6 text-[var(--status-danger-text)]" />

              <div>

                <h3 className="font-semibold text-[var(--status-danger-text)]">

                  Credit Limit
                  Exceeded
                </h3>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">

                  {isAdmin
                    ? "ADMIN override available."
                    : "Order exceeds available credit. Conversion blocked."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 rounded-2xl border border-[var(--status-success-border)] bg-[var(--status-success-bg)] p-5">

              <CheckCircle2 className="mt-0.5 h-6 w-6 text-[var(--status-success-text)]" />

              <div>

                <h3 className="font-semibold text-[var(--status-success-text)]">

                  Credit Check
                  Passed
                </h3>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Dealer has
                  sufficient
                  available
                  credit.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ===================================
            Footer
        =================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-[var(--table-border)] p-6">

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              isBlocked ||
              isSubmitting
            }
            onClick={onConfirm}
          >
            {isSubmitting
              ? "Creating..."
              : "Create Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
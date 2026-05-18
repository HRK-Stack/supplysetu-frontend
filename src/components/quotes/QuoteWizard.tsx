"use client";

/*
  ===================================
  FE-023
  Quote Wizard
  Step 1
  ===================================
*/

import { useState } from "react";

import {
  ArrowRight,
} from "lucide-react";



import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import DealerSelector from "@/components/quotes/DealerSelector";
import QuoteItemBuilder from "./QuoteItemBuilder";

export default function QuoteWizard() {

  /*
    ===================================
    FE-023 CHANGE:
    Wizard state
    ===================================
  */
  const [dealerId, setDealerId] =
    useState<string | null>(
      null,
    );

  const [currentStep, setCurrentStep] =
    useState(1);

  const [
    shipToAddressId,
    setShipToAddressId,
  ] = useState<
    string | null
  >(null);

  /*
    ===================================
    FE-023 CHANGE:
    Default validity = 30
    ===================================
  */
  const [validDays, setValidDays] =
    useState(30);

  return (
    <div className="space-y-6">

      {/* ===================================
          Step Indicator
      =================================== */}

      <Card className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          {/* Step 1 */}

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--navy) text-sm font-semibold text-white">
              1
            </div>

            <div>
              <p className="font-medium text-(--text-primary)">
                Dealer
                Selection
              </p>

              <p className="text-xs text-(--text-muted)">
                Current Step
              </p>
            </div>
          </div>

          <div className="hidden h-px flex-1 bg-(--border) sm:block" />

          {/* Step 2 */}

          <div className="flex items-center gap-3 opacity-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--card) text-sm font-semibold text-(--text-secondary)">
              2
            </div>

            <div>
              <p className="font-medium text-(--text-secondary)">
                Products
              </p>

              <p className="text-xs text-(--text-muted)">
                Upcoming
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ===================================
          Dealer Selection
      =================================== */}

      {currentStep === 1 && (
        <DealerSelector
          dealerId={dealerId}
          onDealerChange={setDealerId}
          shipToAddressId={shipToAddressId}
          onShipToAddressChange={
            setShipToAddressId
          }
          validDays={validDays}
          onValidDaysChange={
            setValidDays
          }
        />
      )}

      {currentStep === 2 &&
        dealerId && (
          <QuoteItemBuilder
            dealerId={dealerId}
          />
      )}

      {/* ===================================
          Footer Actions
      =================================== */}

      <div className="flex items-center justify-between">

        <div>
          {currentStep === 2 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCurrentStep(1);
              }}
            >
              Back
            </Button>
          )}
        </div>

        <div>
          {currentStep === 1 ? (
            <Button
              type="button"
              disabled={!dealerId}
              onClick={() => {
                setCurrentStep(2);
              }}
            >
              Next Step

              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
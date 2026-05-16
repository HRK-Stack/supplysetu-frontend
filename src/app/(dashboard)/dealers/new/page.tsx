// src/app/(dashboard)/dealers/new/page.tsx

"use client";

import { ShieldAlert } from "lucide-react";

import DealerForm from "@/components/dealers/DealerForm";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function NewDealerPage() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  const isForbidden =
    role === "SALES_REP";

  if (isForbidden) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border border-(--red-border) bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--red-light)">
            <ShieldAlert className="h-7 w-7 text-(--red)" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-(--navy)">
            Access Denied
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-(--text2)">
            You do not have permission to create dealers.
          </p>

          <Link href="/dealers" className="w-full">
            <Button className="mt-6 w-full">
              Back to Dealers
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-(--navy)">
          Create Dealer
        </h1>

        <p className="mt-1 text-sm text-(--text3)">
          Add a new dealer account and assign territory access.
        </p>
      </div>

      <DealerForm />
    </div>
  );
}
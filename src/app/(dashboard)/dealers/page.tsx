// src/app/(dashboard)/dealers/page.tsx

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link"; // ✅ CHANGE: Added Next.js Link because Button may not support href prop

import api from "@/lib/api";

import DealerTable from "@/components/dealers/DealerTable";
import DealerFilters from "@/components/dealers/DealerFilters";

import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";

import { useAuth } from "@/hooks/useAuth";

import type { PaginatedResponse } from "@/types/common";
import type { Dealer } from "@/types/dealer";
import type { Territory } from "@/types/territory";

export default function DealersPage() {
  const { role } = useAuth();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [territoryId, setTerritoryId] =
    useState<string>("");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("page_size", String(pageSize));

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status) {
      params.set("status", status);
    }

    if (territoryId) {
      params.set("territory_id", territoryId);
    }

    params.set("sort_by", "created_at");
    params.set("sort_order", "desc");

    return params.toString();
  }, [
    page,
    pageSize,
    search,
    status,
    territoryId,
  ]);

  const dealersQuery = useQuery({
    queryKey: [
      "dealers",
      page,
      pageSize,
      search,
      status,
      territoryId,
    ],

    queryFn: async () => {
      const response =
        await api.get<PaginatedResponse<Dealer>>(
          `/dealers?${queryParams}`,
        );

      return response.data;
    },
  });

  const territoriesQuery = useQuery({
    queryKey: ["territories"],

    queryFn: async () => {
      const response =
        await api.get<PaginatedResponse<Territory>>(
          "/territories?page=1&page_size=100",
        );

      return response.data;
    },
  });

  const dealers =
    dealersQuery.data?.data ?? [];

  const meta =
    dealersQuery.data?.meta;

  const territories =
    territoriesQuery.data?.data ?? [];

  const canCreateDealer =
    role === "ADMIN" ||
    role === "MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-[var(--fh)] text-2xl font-bold text-[var(--navy)]">
            Dealers
          </h1>

          <p className="mt-1 text-sm text-[var(--text3)]">
            Manage dealer accounts,
            territories, and balances.
          </p>
        </div>

        {canCreateDealer && (
          // ✅ CHANGE:
          // Replaced Button href prop with Next.js Link wrapper
          // because many custom Button components
          // do not support href typing
          <Link href="/dealers/new">
            <Button
              variant="primary"
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Dealer
            </Button>
          </Link>
        )}
      </div>

      <DealerFilters
        search={search}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        status={status}
        onStatusChange={(value) => {
          setPage(1);
          setStatus(value);
        }}
        territoryId={territoryId}
        onTerritoryChange={(value) => {
          setPage(1);
          setTerritoryId(value);
        }}
        territories={territories}
      />

      {dealersQuery.isLoading ? (
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : (
        <DealerTable dealers={dealers} />
      )}

      {meta && (
        <Pagination
          page={meta.page}
          pageSize={meta.page_size}
          total={meta.total}
          totalPages={meta.total_pages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPage(1);
            setPageSize(size);
          }}
        />
      )}
    </div>
  );
}
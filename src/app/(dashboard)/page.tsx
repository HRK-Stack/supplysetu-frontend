// // src/app/(dashboard)/page.tsx

// export default function DashboardPage() {
//   return (
//     <main>
//       <h1>SupplySetu Dashboard</h1>
//     </main>
//   );
// }
"use client";

import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const {
    data,
    isLoading,
    error,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Failed to load dashboard
      </div>
    );
  }

  const dashboard = data?.data;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-(--navy)">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Dealers
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {dashboard?.total_dealers}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {dashboard?.total_products}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Quotes
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {dashboard?.total_quotes}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {dashboard?.total_orders}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Pending Exports
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {dashboard?.pending_exports}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Revenue
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ₹
            {dashboard?.revenue?.toLocaleString(
              "en-IN",
            )}
          </h2>
        </div>
      </div>
    </div>
  );
}
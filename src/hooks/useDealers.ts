"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getDealers,
  getDealerById,
} from "@/services/dealer.service";

export function useDealers() {
  return useQuery({
    queryKey: ["dealers"],
    queryFn: getDealers,
  });
}

export function useDealer(
  dealerId: string,
) {
  return useQuery({
    queryKey: ["dealer", dealerId],
    queryFn: () => getDealerById(dealerId),
    enabled: !!dealerId,
  });
}
// // src/hooks/useDealers.ts

// "use client";

// import { useQuery } from "@tanstack/react-query";

// import api from "@/lib/api";

// import type {
//   DealerAddress,
// } from "@/types/dealer";

// interface UseDealerAddressesResponse {
//   addresses: DealerAddress[];

//   isLoading: boolean;

//   error: unknown;

//   refetch: () => void;
// }

// export function useDealerAddresses(
//   dealerId: string,
// ): UseDealerAddressesResponse {
//   const query = useQuery({
//     queryKey: [
//       "dealer-addresses",
//       dealerId,
//     ],

//     enabled:
//       Boolean(dealerId),

//     queryFn: async () => {
//       /*
//         ===================================
//         FE-018
//         Dealer Address List
//         ===================================
//       */

//       const response =
//         await api.get<
//           DealerAddress[]
//         >(
//           `/dealers/${dealerId}/addresses`,
//         );

//       /*
//         ===================================
//         API Response Safety
//         ===================================
//       */

//       if (
//         Array.isArray(
//           response.data,
//         )
//       ) {
//         return response.data;
//       }

//       /*
//         ===================================
//         Support Wrapped API Response
//         ===================================
//       */

//       if (
//         response.data &&
//         typeof response.data ===
//           "object" &&
//         "data" in response.data
//       ) {
//         return (
//           (
//             response.data as {
//               data?: DealerAddress[];
//             }
//           ).data || []
//         );
//       }

//       return [];
//     },
//   });

//   return {
//     addresses:
//       query.data || [],

//     isLoading:
//       query.isLoading,

//     error:
//       query.error,

//     refetch:
//       query.refetch,
//   };
// }
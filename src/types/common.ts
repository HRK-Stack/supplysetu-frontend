// src/types/common.ts
// SupplySetu — Shared API response types

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: ApiError;
    };

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export type PaginatedResponse<T> =
  | {
      success: true;
      data: T[];
      meta: PaginationMeta;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: ApiError;
    };
    
export type UUID = string & { __uuidBrand: never }; 

export type ISODateString = string & { __uuidBrand: never };  // ISO 8601 UTC timestamp

// Common query params shared across list endpoints
export interface ListQueryParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

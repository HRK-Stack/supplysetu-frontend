// src/types/user.ts
// SupplySetu — User domain types

import type { UUID, ISODateString } from "./common";
import type { UserRole } from "./auth";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: UUID;
  tenant_id: UUID;
  name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  version: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
  created_by: UUID | null;
  updated_by: UUID | null;
}

export interface UserCreate {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface UserUpdate {
  version: number; // mandatory for optimistic locking
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserListQueryParams {
  page?: number;
  page_size?: number;
  status?: UserStatus;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

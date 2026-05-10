// src/types/audit.ts
// SupplySetu — Audit log domain types (read-only; immutable)

import type { UUID, ISODateString } from "./common";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "CREDIT_OVERRIDE"
  | "EXPORT_STATUS_CHANGE";

export interface AuditLog {
  readonly id: string;
  readonly tenant_id: string;
  readonly actor_user_id: string;
  readonly entity_type: string;
  readonly entity_id: string;
  readonly action: string;
  readonly old_value: Record<string, unknown> | null;
  readonly new_value: Record<string, unknown> | null;
  readonly created_at: string;
}

export interface AuditLogListQueryParams {
  page?: number;
  page_size?: number;
  entity_type?: string;
  entity_id?: UUID;
  actor_user_id?: UUID;
  created_at_from?: ISODateString;
  created_at_to?: ISODateString;
}

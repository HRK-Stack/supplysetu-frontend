// src/types/auth.ts
// SupplySetu — Authentication & session types

import { User } from "./user";

export type UserRole = "ADMIN" | "MANAGER" | "SALES_REP";

export interface JwtPayload {
  iss: string;       // "supplysetu-auth"
  aud: string;       // "supplysetu-api"
  sub: string;       // user UUID
  tenant_id: string; // tenant UUID
  role: UserRole;
  iat: number;       // issued-at (unix seconds)
  exp: number;       // expiry (unix seconds)
  kid?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginUser = Pick<User, "id" | "name" | "email" | "role" | "tenant_id">;

export interface LoginResponseData {
  access_token: string;
  token_type: "bearer";
  expires_in: number; // seconds (900)
  user: LoginUser;
}

export interface RefreshResponseData {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface SessionsRevokedData {
  sessions_revoked: number;
}

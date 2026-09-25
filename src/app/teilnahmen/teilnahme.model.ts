import type {
  TeilnahmeBuffetBeitrag,
  TeilnahmeKurz as ApiTeilnahmeKurz,
  TeilnahmeRequest,
  TeilnahmeResponse,
  TeilnahmeUpdateRequest,
} from '../api/schema';

/** UC-005/UC-016: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2). */
export type BuffetBeitragEintrag = TeilnahmeBuffetBeitrag;
export type Teilnahme = TeilnahmeResponse;
export type TeilnahmeKurz = ApiTeilnahmeKurz;
export type TeilnahmePayload = TeilnahmeRequest;
/** UC-016: PUT /api/teilnahmen/{id} — Whitelist ohne Einladung. */
export type TeilnahmeUpdatePayload = TeilnahmeUpdateRequest;

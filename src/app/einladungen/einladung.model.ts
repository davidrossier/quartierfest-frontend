import type {
  BuffetBeitrag as ApiBuffetBeitrag,
  EinladungKurz as ApiEinladungKurz,
  EinladungRequest,
  EinladungResponse,
  EinladungStatus as ApiEinladungStatus,
  EinladungUpdateRequest,
} from '../api/schema';

/**
 * UC-004/UC-006: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2).
 * Bestehende Einladungen werden per PUT mit `EinladungUpdatePayload` geändert (REST-003).
 */
export type EinladungStatus = ApiEinladungStatus;
export type BuffetBeitrag = ApiBuffetBeitrag;
export type Einladung = EinladungResponse;
export type EinladungKurz = ApiEinladungKurz;
export type EinladungPayload = EinladungRequest;
export type EinladungUpdatePayload = EinladungUpdateRequest;

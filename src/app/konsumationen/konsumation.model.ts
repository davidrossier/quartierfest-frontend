import type {
  KonsumationRequest,
  KonsumationResponse,
  KonsumationUpdateRequest,
} from '../api/schema';

/** UC-010: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2); PUT ändert nur die Anzahl. */
export type Konsumation = KonsumationResponse;
export type KonsumationPayload = KonsumationRequest;
export type KonsumationUpdatePayload = KonsumationUpdateRequest;

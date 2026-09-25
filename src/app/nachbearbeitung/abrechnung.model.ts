import type {
  AbrechnungRequest,
  AbrechnungResponse,
  AbrechnungUpdateRequest,
  Zustellungskanal,
} from '../api/schema';

/** UC-011/UC-012: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2); Änderungen per PUT (REST-003). */
export type ZustellungsKanal = Zustellungskanal;
export type Abrechnung = AbrechnungResponse;
export type AbrechnungPayload = AbrechnungRequest;
export type AbrechnungUpdatePayload = AbrechnungUpdateRequest;

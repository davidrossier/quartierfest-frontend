import type { Zahlungskanal, ZahlungRequest, ZahlungResponse } from '../api/schema';

/** UC-013: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2). */
export type ZahlungsKanal = Zahlungskanal;
export type Zahlung = ZahlungResponse;
export type ZahlungPayload = ZahlungRequest;

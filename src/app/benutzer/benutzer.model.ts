import type { BenutzerRequest, BenutzerResponse } from '../api/schema';

/** UC-015: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2); Passwort und Hash liefert das Backend nie. */
export type Benutzer = BenutzerResponse;
export type BenutzerPayload = BenutzerRequest;

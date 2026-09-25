import type { ParteiKurz as ApiParteiKurz, ParteiRequest, ParteiResponse } from '../api/schema';

/**
 * UC-002: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2). `Partei` enthält die Personen und
 * kommt nur von /api/parteien; in Einladung, Teilnahme, Abrechnung und Benutzer steckt `ParteiKurz` ohne Personen.
 */
export type Partei = ParteiResponse;
export type ParteiKurz = ApiParteiKurz;
export type ParteiPayload = ParteiRequest;

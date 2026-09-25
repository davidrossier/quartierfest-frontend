import type { PersonRequest, PersonResponse } from '../api/schema';

/** UC-001: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2). */
export type Person = PersonResponse;
export type PersonPayload = PersonRequest;

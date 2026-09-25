import type { AllgemeinausgabeRequest, AllgemeinausgabeResponse } from '../api/schema';

/** UC-007: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2); derselbe Payload für POST und PUT. */
export type Allgemeinausgabe = AllgemeinausgabeResponse;
export type AllgemeinausgabePayload = AllgemeinausgabeRequest;

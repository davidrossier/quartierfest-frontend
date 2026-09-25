import type { MahnungRequest, MahnungResponse } from '../api/schema';

/** UC-013: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2). */
export type Mahnung = MahnungResponse;
export type MahnungPayload = MahnungRequest;

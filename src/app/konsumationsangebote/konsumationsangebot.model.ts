import type { KonsumationsangebotRequest, KonsumationsangebotResponse } from '../api/schema';

/** UC-008: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2); derselbe Payload für POST und PUT. */
export type Konsumationsangebot = KonsumationsangebotResponse;
export type KonsumationsangebotPayload = KonsumationsangebotRequest;

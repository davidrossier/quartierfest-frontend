import type { EventRequest, EventResponse } from '../api/schema';

/** UC-003: Contract-Typen aus dem OpenAPI-Schema (API-001 Stufe 2). */
export type Event = EventResponse;
export type EventPayload = EventRequest;

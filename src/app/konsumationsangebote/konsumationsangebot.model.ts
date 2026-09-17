import type { Konsumationsangebot as ApiKonsumationsangebot } from '../api/schema';
import { Persisted } from '../api/types';
import { Event } from '../events/event.model';

/** Antwort-Typ aus dem OpenAPI-Schema (API-001). */
export type Konsumationsangebot = Persisted<Omit<ApiKonsumationsangebot, 'event'>> & {
  event: Event;
};

export interface KonsumationsangebotPayload {
  id?: number;
  event: { id: number };
  bezeichnung: string;
  preis: number;
}

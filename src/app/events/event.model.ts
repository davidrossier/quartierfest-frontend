import type { Event as ApiEvent } from '../api/schema';
import { Persisted } from '../api/types';

/** Antwort-Typ aus dem OpenAPI-Schema (API-001). */
export type Event = Persisted<ApiEvent>;

export interface EventPayload {
  datum: string;
  startzeit: string;
  standort: string;
  alternativerStandort?: string;
  zeitAufstellen?: string;
  zeitAufraumen?: string;
}

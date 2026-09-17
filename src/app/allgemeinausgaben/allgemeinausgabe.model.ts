import type { Allgemeinausgabe as ApiAllgemeinausgabe } from '../api/schema';
import { Persisted } from '../api/types';
import { Event } from '../events/event.model';

/** Antwort-Typ aus dem OpenAPI-Schema (API-001). */
export type Allgemeinausgabe = Persisted<Omit<ApiAllgemeinausgabe, 'event'>> & {
  event: Event;
};

export interface AllgemeinausgabePayload {
  id?: number;
  event: { id: number };
  beschreibung: string;
  herkunft?: string;
  betrag: number;
}

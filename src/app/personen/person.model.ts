import type { Person as ApiPerson } from '../api/schema';
import { Persisted } from '../api/types';

/** Antwort-Typ aus dem OpenAPI-Schema (API-001). */
export type Person = Persisted<ApiPerson>;

export interface PersonPayload {
  vorname: string;
  name: string;
  telefonnummer?: string;
  mobilenummer?: string;
  email?: string;
}

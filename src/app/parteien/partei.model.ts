import type { Partei as ApiPartei } from '../api/schema';
import { Persisted } from '../api/types';
import { Person } from '../personen/person.model';

/**
 * Antwort-Typ aus dem OpenAPI-Schema (API-001). `personenIds` ist write-only (nur im Payload),
 * `personen` liefert das Backend immer als Liste, `twintAktiv` ist ein primitiver boolean.
 */
export type Partei = Persisted<Omit<ApiPartei, 'personen' | 'personenIds'>, 'twintAktiv'> & {
  personen: Person[];
};

export interface ParteiPayload {
  bezeichnung: string;
  adresse: string;
  twintAktiv: boolean;
  twintMobilenummer?: string;
  personenIds: number[];
}

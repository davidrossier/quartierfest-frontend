import type { Benutzer as ApiBenutzer } from '../api/schema';
import { Persisted } from '../api/types';
import { Rolle } from '../auth/auth.service';
import { Partei } from '../parteien/partei.model';

/**
 * UC-015: Benutzeraccount — Antwort-Typ aus dem OpenAPI-Schema (API-001).
 * `passwort` ist write-only (nur im Payload); `partei` liefert das Backend als `null`, wenn keine zugeordnet ist.
 */
export type Benutzer = Persisted<Omit<ApiBenutzer, 'passwort' | 'partei'>> & {
  partei?: Partei | null;
};

export interface BenutzerPayload {
  email: string;
  passwort: string;
  rolle: Rolle;
  partei?: { id: number } | null;
}

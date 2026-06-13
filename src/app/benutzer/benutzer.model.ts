import { Rolle } from '../auth/auth.service';

/** UC-015: Benutzeraccount — Passwörter erscheinen nie in API-Antworten. */
export interface Benutzer {
  id: number;
  email: string;
  rolle: Rolle;
  partei?: { id: number; bezeichnung: string } | null;
}

export interface BenutzerPayload {
  email: string;
  passwort: string;
  rolle: Rolle;
  partei?: { id: number } | null;
}

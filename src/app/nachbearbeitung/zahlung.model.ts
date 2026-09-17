import type { Zahlung as ApiZahlung } from '../api/schema';
import { Persisted } from '../api/types';
import { Abrechnung } from './abrechnung.model';

export type ZahlungsKanal = ApiZahlung['zahlungskanal'];

/** Antwort-Typ aus dem OpenAPI-Schema (API-001). */
export type Zahlung = Persisted<Omit<ApiZahlung, 'abrechnung'>> & {
  abrechnung: Abrechnung;
};

export interface ZahlungPayload {
  abrechnung: { id: number };
  zahlungskanal: ZahlungsKanal;
  datum: string;
  betrag: number;
}

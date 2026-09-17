import type { Abrechnung as ApiAbrechnung } from '../api/schema';
import { Persisted } from '../api/types';
import { Teilnahme } from '../teilnahmen/teilnahme.model';

export type ZustellungsKanal = ApiAbrechnung['zustellungskanal'];

/** Antwort-Typ aus dem OpenAPI-Schema (API-001). */
export type Abrechnung = Persisted<Omit<ApiAbrechnung, 'teilnahme'>> & {
  teilnahme: Teilnahme;
};

export interface AbrechnungPayload {
  id?: number;
  teilnahme: { id: number };
  anteilAllgemeinkosten: number;
  totalKonsumation: number;
  totalBetrag: number;
  zustellungskanal: ZustellungsKanal;
  zustellungsDatum?: string;
}

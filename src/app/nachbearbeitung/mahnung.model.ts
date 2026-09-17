import type { Mahnung as ApiMahnung } from '../api/schema';
import { Persisted } from '../api/types';
import { Abrechnung } from './abrechnung.model';

/** Antwort-Typ aus dem OpenAPI-Schema (API-001). */
export type Mahnung = Persisted<Omit<ApiMahnung, 'abrechnung'>> & {
  abrechnung: Abrechnung;
};

export interface MahnungPayload {
  abrechnung: { id: number };
  datum: string;
  bemerkung?: string;
}

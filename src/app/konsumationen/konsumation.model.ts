import type { Konsumation as ApiKonsumation } from '../api/schema';
import { Persisted } from '../api/types';
import { Konsumationsangebot } from '../konsumationsangebote/konsumationsangebot.model';
import { Teilnahme } from '../teilnahmen/teilnahme.model';

/** Antwort-Typ aus dem OpenAPI-Schema (API-001). */
export type Konsumation = Persisted<Omit<ApiKonsumation, 'teilnahme' | 'konsumationsangebot'>> & {
  teilnahme: Teilnahme;
  konsumationsangebot: Konsumationsangebot;
};

export interface KonsumationPayload {
  id?: number;
  teilnahme: { id: number };
  konsumationsangebot: { id: number };
  anzahl: number;
}

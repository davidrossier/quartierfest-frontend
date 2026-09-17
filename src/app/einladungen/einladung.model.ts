import type { Einladung as ApiEinladung } from '../api/schema';
import { Persisted } from '../api/types';
import { Event } from '../events/event.model';
import { Partei } from '../parteien/partei.model';

export type EinladungStatus = ApiEinladung['status'];
export type BuffetBeitrag = NonNullable<ApiEinladung['buffetBeitrag']>;

/** Antwort-Typ aus dem OpenAPI-Schema (API-001); `bestaetigungVersendet` ist ein primitiver boolean. */
export type Einladung = Persisted<
  Omit<ApiEinladung, 'event' | 'partei'>,
  'bestaetigungVersendet'
> & {
  event: Event;
  partei: Partei;
};

export interface EinladungPayload {
  id?: number;
  event: { id: number };
  partei: { id: number };
  status: EinladungStatus;
  anzahlPersonen?: number;
  hilftAufstellen?: boolean;
  hilftAufraumen?: boolean;
  buffetBeitrag?: BuffetBeitrag;
  buffetBeitragBeschreibung?: string;
  bestaetigungVersendet: boolean;
}

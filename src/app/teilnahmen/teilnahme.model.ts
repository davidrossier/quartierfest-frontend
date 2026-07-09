import { BuffetBeitrag } from '../einladungen/einladung.model';

export interface BuffetBeitragEintrag {
  art: BuffetBeitrag;
  beschreibung?: string;
}

export interface Teilnahme {
  id: number;
  einladung: {
    id: number;
    event: { id: number; datum: string; standort: string };
    partei: { id: number; bezeichnung: string };
    status: string;
    anzahlPersonen?: number;
    hilftAufstellen?: boolean;
    hilftAufraumen?: boolean;
    buffetBeitrag?: BuffetBeitrag;
    buffetBeitragBeschreibung?: string;
  };
  anzahlPersonenEffektiv?: number;
  hilftAufstellen?: boolean;
  hilftAufraumen?: boolean;
  buffetBeitraege: BuffetBeitragEintrag[];
}

export interface TeilnahmePayload {
  einladung: { id: number };
  anzahlPersonenEffektiv?: number;
  hilftAufstellen?: boolean;
  hilftAufraumen?: boolean;
  buffetBeitraege: BuffetBeitragEintrag[];
}

/** UC-016: PUT /api/teilnahmen/{id} — Whitelist ohne einladung. */
export interface TeilnahmeUpdatePayload {
  anzahlPersonenEffektiv?: number;
  hilftAufstellen?: boolean;
  hilftAufraumen?: boolean;
  buffetBeitraege: BuffetBeitragEintrag[];
}

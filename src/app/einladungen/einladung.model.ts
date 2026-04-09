export type EinladungStatus = 'OFFEN' | 'ANGEMELDET' | 'ABGEMELDET';
export type BuffetBeitrag = 'KEINER' | 'SALAT' | 'BROT_ZOPF' | 'DESSERT' | 'WEITERE';

export interface Einladung {
  id: number;
  event: { id: number; datum: string; startzeit: string; standort: string };
  partei: { id: number; bezeichnung: string; adresse: string };
  status: EinladungStatus;
  anzahlPersonen?: number;
  hilftAufstellen?: boolean;
  hilftAufraumen?: boolean;
  buffetBeitrag?: BuffetBeitrag;
  buffetBeitragBeschreibung?: string;
  bestaetigungVersendet: boolean;
}

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

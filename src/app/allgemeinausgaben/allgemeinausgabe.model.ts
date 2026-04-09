export interface Allgemeinausgabe {
  id: number;
  event: { id: number; datum: string; standort: string };
  beschreibung: string;
  herkunft?: string;
  betrag: number;
}

export interface AllgemeinausgabePayload {
  id?: number;
  event: { id: number };
  beschreibung: string;
  herkunft?: string;
  betrag: number;
}

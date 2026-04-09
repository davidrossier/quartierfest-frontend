export interface Konsumationsangebot {
  id: number;
  event: { id: number; datum: string; standort: string };
  bezeichnung: string;
  preis: number;
}

export interface KonsumationsangebotPayload {
  id?: number;
  event: { id: number };
  bezeichnung: string;
  preis: number;
}

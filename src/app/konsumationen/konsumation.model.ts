export interface Konsumation {
  id: number;
  teilnahme: {
    id: number;
    einladung: {
      id: number;
      event: { id: number; datum: string; standort: string };
      partei: { id: number; bezeichnung: string };
    };
  };
  konsumationsangebot: { id: number; bezeichnung: string; preis: number };
  anzahl: number;
}

export interface KonsumationPayload {
  id?: number;
  teilnahme: { id: number };
  konsumationsangebot: { id: number };
  anzahl: number;
}

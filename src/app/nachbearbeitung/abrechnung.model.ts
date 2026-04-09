export type ZustellungsKanal = 'TWINT' | 'EMAIL' | 'PAPIER';

export interface Abrechnung {
  id: number;
  teilnahme: {
    id: number;
    einladung: {
      id: number;
      event: { id: number; datum: string; standort: string };
      partei: {
        id: number;
        bezeichnung: string;
        adresse: string;
        twintAktiv: boolean;
        twintMobilenummer?: string;
      };
    };
    anzahlPersonenEffektiv?: number;
  };
  anteilAllgemeinkosten: number;
  totalKonsumation: number;
  totalBetrag: number;
  zustellungskanal: ZustellungsKanal;
  zustellungsDatum?: string;
}

export interface AbrechnungPayload {
  id?: number;
  teilnahme: { id: number };
  anteilAllgemeinkosten: number;
  totalKonsumation: number;
  totalBetrag: number;
  zustellungskanal: ZustellungsKanal;
  zustellungsDatum?: string;
}

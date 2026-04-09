export type ZahlungsKanal = 'TWINT' | 'UEBERWEISUNG' | 'BAR';

export interface Zahlung {
  id: number;
  abrechnung: { id: number };
  zahlungskanal: ZahlungsKanal;
  datum: string;
  betrag: number;
}

export interface ZahlungPayload {
  abrechnung: { id: number };
  zahlungskanal: ZahlungsKanal;
  datum: string;
  betrag: number;
}

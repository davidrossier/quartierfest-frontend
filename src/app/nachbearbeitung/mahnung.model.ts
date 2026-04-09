export interface Mahnung {
  id: number;
  abrechnung: { id: number };
  datum: string;
  bemerkung?: string;
}

export interface MahnungPayload {
  abrechnung: { id: number };
  datum: string;
  bemerkung?: string;
}

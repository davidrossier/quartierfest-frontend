export interface Event {
  id: number;
  datum: string;
  startzeit: string;
  standort: string;
  alternativerStandort?: string;
  zeitAufstellen?: string;
  zeitAufraumen?: string;
}

export interface EventPayload {
  datum: string;
  startzeit: string;
  standort: string;
  alternativerStandort?: string;
  zeitAufstellen?: string;
  zeitAufraumen?: string;
}

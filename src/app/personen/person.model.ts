export interface Person {
  id: number;
  vorname: string;
  name: string;
  telefonnummer?: string;
  mobilenummer?: string;
  email?: string;
}

export interface PersonPayload {
  vorname: string;
  name: string;
  telefonnummer?: string;
  mobilenummer?: string;
  email?: string;
}

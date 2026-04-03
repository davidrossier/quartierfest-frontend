import { Person } from '../personen/person.model';

export interface Partei {
  id: number;
  bezeichnung: string;
  adresse: string;
  twintAktiv: boolean;
  twintMobilenummer?: string;
  personen: Person[];
}

export interface ParteiPayload {
  bezeichnung: string;
  adresse: string;
  twintAktiv: boolean;
  twintMobilenummer?: string;
  personenIds: number[];
}

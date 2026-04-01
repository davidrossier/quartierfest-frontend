import { Person } from '../personen/person.model';

export interface Partei {
  id: number;
  adresse: string;
  twintAktiv: boolean;
  twintMobilenummer?: string;
  personen: Person[];
}

export interface ParteiPayload {
  adresse: string;
  twintAktiv: boolean;
  twintMobilenummer?: string;
  personenIds: number[];
}

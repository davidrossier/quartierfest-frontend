import { Routes } from '@angular/router';
import { PersonenVerwaltungComponent } from './personen/personen-verwaltung.component';

export const routes: Routes = [
  { path: 'personen', component: PersonenVerwaltungComponent },
  { path: '', redirectTo: 'personen', pathMatch: 'full' },
];

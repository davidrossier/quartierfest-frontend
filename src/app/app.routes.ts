import { Routes } from '@angular/router';
import { PersonenVerwaltungComponent } from './personen/personen-verwaltung.component';
import { ParteienVerwaltungComponent } from './parteien/parteien-verwaltung.component';

export const routes: Routes = [
  { path: 'personen', component: PersonenVerwaltungComponent },
  { path: 'parteien', component: ParteienVerwaltungComponent },
  { path: '', redirectTo: 'personen', pathMatch: 'full' },
];

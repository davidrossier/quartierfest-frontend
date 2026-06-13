import { Routes } from '@angular/router';
import { PersonenVerwaltungComponent } from './personen/personen-verwaltung.component';
import { ParteienVerwaltungComponent } from './parteien/parteien-verwaltung.component';
import { EventKontextLayoutComponent } from './event-kontext/event-kontext-layout.component';
import { EventsVerwaltungComponent } from './events/events-verwaltung.component';
import { EinladungenVerwaltungComponent } from './einladungen/einladungen-verwaltung.component';
import { TeilnahmenVerwaltungComponent } from './teilnahmen/teilnahmen-verwaltung.component';
import { KonsumationsangeboteVerwaltungComponent } from './konsumationsangebote/konsumationsangebote-verwaltung.component';
import { BestaetigungUebersichtComponent } from './bestaetigung/bestaetigung-uebersicht.component';
import { AllgemeinausgabenVerwaltungComponent } from './allgemeinausgaben/allgemeinausgaben-verwaltung.component';
import { KonsumationslisteComponent } from './konsumationsliste/konsumationsliste.component';
import { KonsumationenVerwaltungComponent } from './konsumationen/konsumationen-verwaltung.component';
import { AbrechnungenVerwaltungComponent } from './nachbearbeitung/abrechnungen-verwaltung.component';
import { InkassoVerwaltungComponent } from './nachbearbeitung/inkasso-verwaltung.component';
import { LoginComponent } from './auth/login.component';
import { BenutzerVerwaltungComponent } from './benutzer/benutzer-verwaltung.component';
import { MeineTeilnahmeComponent } from './meine-teilnahme/meine-teilnahme.component';
import { authGuard, roleGuard } from './auth/auth.guard';

// UC-014: /login ist offen; alle übrigen Routen sind rollenbasiert geschützt
const nurOrganisator = [authGuard, roleGuard('ORGANISATOR')];
const nurPartei = [authGuard, roleGuard('PARTEI')];

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'personen', component: PersonenVerwaltungComponent, canActivate: nurOrganisator },
  { path: 'parteien', component: ParteienVerwaltungComponent, canActivate: nurOrganisator },
  { path: 'events', component: EventsVerwaltungComponent, canActivate: nurOrganisator },
  {
    path: 'admin/benutzer',
    component: BenutzerVerwaltungComponent,
    canActivate: nurOrganisator,
  },
  {
    path: 'meine-teilnahme',
    component: MeineTeilnahmeComponent,
    canActivate: nurPartei,
  },
  {
    path: 'planung',
    component: EventKontextLayoutComponent,
    canActivate: nurOrganisator,
    data: { gruppe: 'planung' },
    children: [
      { path: 'einladungen', component: EinladungenVerwaltungComponent },
      { path: 'teilnahmen', component: TeilnahmenVerwaltungComponent },
      { path: 'konsumationsangebote', component: KonsumationsangeboteVerwaltungComponent },
      { path: 'bestaetigung', component: BestaetigungUebersichtComponent },
      { path: 'allgemeinausgaben', component: AllgemeinausgabenVerwaltungComponent },
      { path: '', redirectTo: 'einladungen', pathMatch: 'full' },
    ],
  },
  {
    path: 'durchfuehrung',
    component: EventKontextLayoutComponent,
    canActivate: nurOrganisator,
    data: { gruppe: 'durchfuehrung' },
    children: [
      { path: 'konsumationsliste', component: KonsumationslisteComponent },
      { path: 'konsumationen', component: KonsumationenVerwaltungComponent },
      { path: '', redirectTo: 'konsumationsliste', pathMatch: 'full' },
    ],
  },
  {
    path: 'nachbearbeitung',
    component: EventKontextLayoutComponent,
    canActivate: nurOrganisator,
    data: { gruppe: 'nachbearbeitung' },
    children: [
      { path: 'abrechnungen', component: AbrechnungenVerwaltungComponent },
      { path: 'inkasso', component: InkassoVerwaltungComponent },
      { path: '', redirectTo: 'abrechnungen', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'personen', pathMatch: 'full' },
];

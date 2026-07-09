# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200 (hot reload)
npm run build      # Production build (output in dist/)
npm run watch      # Dev build in watch mode
npm test           # Run unit tests with Vitest
```

To generate Angular artifacts:
```bash
npx ng generate component <name>
npx ng generate service <name>
```

**CI:** GitHub Actions (`.github/workflows/ci.yml`) läuft bei Push/PR auf `main`: `npm ci` → `npm test -- --watch=false` → `npm run build -- --configuration production` (Node 24). Playwright-E2E läuft nur lokal (braucht Backend + PostgreSQL).

## Architecture

Angular 21 standalone application — no NgModules. Every component uses the standalone API (`@Component` with `imports` array).

**Key files:**
- `src/main.ts` — Bootstrap entry point using `bootstrapApplication`
- `src/app/app.config.ts` — Application-level providers and configuration
- `src/app/app.routes.ts` — Route definitions
- `src/app/app.ts` — Root component with `<router-outlet>`
- `src/app/shared/sortierung.ts` — Shared table sorting utilities

**State management:** Angular Signals (`signal`, `computed`) for local/shared state; RxJS Observables for HTTP calls.

**Testing:** Vitest (not Karma/Jasmine). Test files are `*.spec.ts` alongside source files.

**Formatting:** Prettier with 100-char line width, single quotes. No ESLint configured.

**TypeScript:** Strict mode with `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, Angular strict template checking.

## Authentifizierung (UC-014, AUTH-002 — Eigenbau)

Alle Routen ausser `/login` sind durch funktionale Guards geschützt (`authGuard` + `roleGuard('ORGANISATOR'|'PARTEI')` in `src/app/auth/auth.guard.ts`). Rollenbasiertes Routing nach Login: `ORGANISATOR` → `/personen`, `PARTEI` → `/meine-teilnahme`.

- **`AuthService`** (`src/app/auth/auth.service.ts`): `login()` ruft `POST /api/auth/login`, legt das JWT in `sessionStorage` (Key `quartierfest.token`) ab; `rolle()`/`email()` sind Signals aus dem dekodierten JWT-Payload; `logout()` löscht Token und leitet zu `/login`.
- **`authInterceptor`** (registriert in `app.config.ts` via `withInterceptors`): hängt `Authorization: Bearer` an alle `/api/**`-Requests; bei 401 (ausser vom Login-Endpunkt) wird die Sitzung verworfen → `/login`.
- **Navigation** (`app.html`): rollenabhängig via `@if (auth.rolle() === ...)`; angemeldete Benutzer sehen E-Mail + Abmelden-Button.
- **Dev-Login:** Bootstrap-Admin `admin@quartierfest.local` / `quartierfest-admin` (Backend legt ihn beim Start an).

## Navigation & Routing

Main nav is split into **Stammdaten** (no event context) and three event-scoped sections. The three event sections share an `EventKontextLayoutComponent` that provides an event-selector dropdown and a sub-navigation bar. Alle Bereiche ausser «Meine Teilnahme» sind nur für `ORGANISATOR` sichtbar.

### Auth & Partei-Sicht
| Route | Component | Rolle |
|---|---|---|
| `/login` | LoginComponent | öffentlich |
| `/admin/benutzer` | BenutzerVerwaltungComponent | ORGANISATOR |
| `/meine-teilnahme` | MeineTeilnahmeComponent | PARTEI |

### Stammdaten (no event context)
| Route | Component |
|---|---|
| `/personen` | PersonenVerwaltungComponent |
| `/parteien` | ParteienVerwaltungComponent |
| `/events` | EventsVerwaltungComponent |

### Event-Planung (`/planung/*`)
| Route | Component |
|---|---|
| `/planung/einladungen` | EinladungenVerwaltungComponent |
| `/planung/teilnahmen` | TeilnahmenVerwaltungComponent |
| `/planung/konsumationsangebote` | KonsumationsangeboteVerwaltungComponent |
| `/planung/bestaetigung` | BestaetigungUebersichtComponent |
| `/planung/allgemeinausgaben` | AllgemeinausgabenVerwaltungComponent |

### Event-Durchführung (`/durchfuehrung/*`)
| Route | Component |
|---|---|
| `/durchfuehrung/konsumationsliste` | KonsumationslisteComponent |
| `/durchfuehrung/konsumationen` | KonsumationenVerwaltungComponent |

### Nachbearbeitung (`/nachbearbeitung/*`)
| Route | Component |
|---|---|
| `/nachbearbeitung/abrechnungen` | AbrechnungenVerwaltungComponent |
| `/nachbearbeitung/inkasso` | InkassoVerwaltungComponent |

## Implementierte Features

### Stammdaten

**Personenverwaltung** (`src/app/personen/`)
- `person.model.ts` — `Person` (id, vorname, name, telefonnummer?, mobilenummer?, email?), `PersonPayload`
- `person.service.ts` — `GET/POST/PUT/DELETE /api/persons`
- Route `/personen`

**Parteiverwaltung** (`src/app/parteien/`)
- `partei.model.ts` — `Partei` (id, bezeichnung, adresse, twintAktiv, twintMobilenummer?, personen: Person[]), `ParteiPayload` (personenIds: number[])
- `partei.service.ts` — `GET/POST/PUT/DELETE /api/parteien`
- Route `/parteien`

**Eventverwaltung** (`src/app/events/`)
- `event.model.ts` — `Event` (id, datum, startzeit, standort, alternativerStandort?, zeitAufstellen?, zeitAufraumen?), `EventPayload`
- `event.service.ts` — `GET/POST/PUT/DELETE /api/events`
- Route `/events`

### Event-Kontext

**EventKontextService** (`src/app/event-kontext/event-kontext.service.ts`)
- Hält `events[]` Signal, `selectedEventId` Signal und `computed selectedEvent`
- Wird von allen event-scoped Komponenten injiziert

**EventKontextLayoutComponent** (`src/app/event-kontext/`)
- Wrapper-Layout mit Event-Selector-Dropdown und dynamischer Subnav
- Route-Group (`planung` / `durchfuehrung` / `nachbearbeitung`) bestimmt welche Subnav-Links angezeigt werden

### Planung

**Einladungsverwaltung** (`src/app/einladungen/`)
- `einladung.model.ts` — `Einladung` (id, event, partei, status: EinladungStatus, anzahlPersonen?, hilftAufstellen?, hilftAufraumen?, buffetBeitrag?: BuffetBeitrag, buffetBeitragBeschreibung?, bestaetigungVersendet), `EinladungPayload`
- Types: `EinladungStatus = 'OFFEN' | 'ANGEMELDET' | 'ABGEMELDET'`, `BuffetBeitrag = 'KEINER' | 'SALAT' | 'BROT_ZOPF' | 'DESSERT' | 'WEITERE'`
- `einladung.service.ts` — `GET/POST/DELETE /api/einladungen`
- Bulk-Erstellung für alle Parteien, Status- und Büffetbeitrags-Verwaltung

**Teilnahmeverwaltung** (`src/app/teilnahmen/`)
- `teilnahme.model.ts` — `Teilnahme` (id, einladung, anzahlPersonenEffektiv?, hilftAufstellen?, hilftAufraumen?, buffetBeitraege: BuffetBeitragEintrag[]), `TeilnahmePayload`, `TeilnahmeUpdatePayload` (UC-016-Whitelist ohne einladung)
- `teilnahme.service.ts` — `GET/POST/DELETE /api/teilnahmen`, `getMeine()` (UC-016), `update(id, dto)` (UC-016)
- FormArray für mehrere Büffetbeiträge

**Konsumationsangebote** (`src/app/konsumationsangebote/`)
- `konsumationsangebot.model.ts` — `Konsumationsangebot` (id, event, bezeichnung, preis), `KonsumationsangebotPayload`
- `konsumationsangebot.service.ts` — `GET/POST/DELETE /api/konsumationsangebote`

**Bestätigungsübersicht** (`src/app/bestaetigung/`)
- Zeigt Einladungen mit Status ANGEMELDET, aggregiert Büffetbeiträge
- Markieren als "Bestätigung versendet"

**Allgemeinausgaben** (`src/app/allgemeinausgaben/`)
- `allgemeinausgabe.model.ts` — `Allgemeinausgabe` (id, event, beschreibung, herkunft?, betrag), `AllgemeinausgabePayload`
- `allgemeinausgabe.service.ts` — `GET/POST/DELETE /api/allgemeinausgaben`

### Durchführung

**Konsumationsliste** (`src/app/konsumationsliste/`)
- Read-only Übersicht aller Teilnahmen und Angebote, Druckansicht
- Nutzt TeilnahmeService und KonsumationsangebotService

**Konsumationsverwaltung** (`src/app/konsumationen/`)
- `konsumation.model.ts` — `Konsumation` (id, teilnahme, konsumationsangebot, anzahl), `KonsumationPayload`
- `konsumation.service.ts` — `GET/POST/DELETE /api/konsumationen`
- Matrix-Eingabe: Teilnahmen × Angebote

### Nachbearbeitung

**Abrechnungen** (`src/app/nachbearbeitung/`)
- `abrechnung.model.ts` — `Abrechnung` (id, teilnahme, anteilAllgemeinkosten, totalKonsumation, totalBetrag, zustellungskanal: ZustellungsKanal, zustellungsDatum?), `AbrechnungPayload`
- Type: `ZustellungsKanal = 'TWINT' | 'EMAIL' | 'PAPIER'`
- `abrechnung.service.ts` — `GET/POST/DELETE /api/abrechnungen`
- Berechnung von Anteilen, Zustellungskanal-Verwaltung

**Inkasso** (`src/app/nachbearbeitung/`)
- `mahnung.model.ts` — `Mahnung` (id, abrechnung, datum, bemerkung?), `MahnungPayload`
- `mahnung.service.ts` — `GET/POST/DELETE /api/mahnungen`
- `zahlung.model.ts` — `Zahlung` (id, abrechnung, zahlungskanal: ZahlungsKanal, datum, betrag), `ZahlungPayload`
- Type: `ZahlungsKanal = 'TWINT' | 'UEBERWEISUNG' | 'BAR'`
- `zahlung.service.ts` — `GET/POST/DELETE /api/zahlungen`

### Auth (UC-014/015/016)

**Login** (`src/app/auth/`)
- `auth.service.ts` — Login/Logout, Token in `sessionStorage`, Signals `istAngemeldet`/`rolle`/`email`
- `auth.interceptor.ts` — Bearer-Header + 401-Handling (funktionaler Interceptor)
- `auth.guard.ts` — `authGuard`, `roleGuard(rolle)` (funktionale Guards)
- `login.component.*` — Login-Formular unter `/login`

**Benutzerverwaltung** (`src/app/benutzer/`)
- `benutzer.model.ts` — `Benutzer` (id, email, rolle, partei?), `BenutzerPayload` (inkl. passwort, nur im Request)
- `benutzer.service.ts` — `GET/POST/DELETE /api/benutzer`, `passwortSetzen(id, passwort)` → `PUT /api/benutzer/{id}/passwort`
- `BenutzerVerwaltungComponent` — Accounts anlegen (E-Mail, Initialpasswort min. 10 Zeichen, Rolle, Partei-Dropdown bei PARTEI), Passwort-Reset (window.prompt), Löschen (window.confirm)

**Meine Teilnahme** (`src/app/meine-teilnahme/`)
- `MeineTeilnahmeComponent` — Partei-Sicht auf die eigene Teilnahme zum nächsten Event; speichert via `PUT /api/teilnahmen/{id}` (Whitelist-Payload); 404 → Hinweis «noch keine Teilnahme erstellt»

## Environments

Die Backend-URL wird über Angular-Environments konfiguriert:

| Datei | `apiUrl` | Verwendung |
|---|---|---|
| `src/environments/environment.ts` | `http://localhost:8080` | Dev-Server (`npm start`) |
| `src/environments/environment.prod.ts` | `''` (leer) | Production-Build (`npm run build`) |

Alle Services importieren `environment` aus `../../environments/environment` und bauen die `baseUrl` als `` `${environment.apiUrl}/api/<ressource>` ``. Im Production-Build ersetzt `angular.json` (`fileReplacements`) automatisch `environment.ts` durch `environment.prod.ts`, sodass relative URLs (`/api/...`) entstehen — Nginx routet diese zum Backend.

## Backend

REST API läuft lokal auf `http://localhost:8080`. Spezifikationen: `../quartierfest-backend/specs/`

| Ressource | Endpunkte |
|---|---|
| Personen | `GET/POST /api/persons`, `PUT/DELETE /api/persons/{id}` |
| Parteien | `GET/POST /api/parteien`, `PUT/DELETE /api/parteien/{id}` |
| Events | `GET/POST /api/events`, `PUT/DELETE /api/events/{id}` |
| Einladungen | `GET/POST /api/einladungen`, `DELETE /api/einladungen/{id}` |
| Teilnahmen | `GET/POST /api/teilnahmen`, `DELETE /api/teilnahmen/{id}` |
| Konsumationsangebote | `GET/POST /api/konsumationsangebote`, `DELETE /api/konsumationsangebote/{id}` |
| Konsumationen | `GET/POST /api/konsumationen`, `DELETE /api/konsumationen/{id}` |
| Allgemeinausgaben | `GET/POST /api/allgemeinausgaben`, `DELETE /api/allgemeinausgaben/{id}` |
| Abrechnungen | `GET/POST /api/abrechnungen`, `DELETE /api/abrechnungen/{id}` |
| Mahnungen | `GET/POST /api/mahnungen`, `DELETE /api/mahnungen/{id}` |
| Zahlungen | `GET/POST /api/zahlungen`, `DELETE /api/zahlungen/{id}` |
| Auth | `POST /api/auth/login` → `{token}` (HS256-JWT, 12 h) |
| Benutzer | `GET/POST /api/benutzer`, `DELETE /api/benutzer/{id}`, `PUT /api/benutzer/{id}/passwort` |
| Teilnahme (PARTEI) | `GET /api/teilnahmen/meine`, `PUT /api/teilnahmen/{id}` (Whitelist-DTO) |

## E2E-Tests (Playwright)

- `e2e/fixtures.ts`: gemeinsame `test`-Fixture injiziert das Token des Bootstrap-Organisators via `addInitScript` in `sessionStorage` — alle Organisator-Specs importieren `{ test, expect } from '../fixtures'` statt `@playwright/test`.
- `UC-014_Benutzer-Anmelden.spec.ts` und `UC-016_Teilnahme-Bestaetigen.spec.ts` importieren bewusst `@playwright/test` (UC-014 testet den UI-Login selbst; UC-016 meldet sich als PARTEI-Benutzer an).
- Auth-Helper in `e2e/helpers/api-helpers.ts`: `login()`, `getOrganisatorToken()`, `createTestBenutzer()`, `deleteTestBenutzerByEmail()`, `inTagen()`.
- Voraussetzung: Backend (Port 8080, `dev`-Profil — `./mvnw spring-boot:run` setzt es automatisch) und `npm start` (Port 4200) laufen; `npx playwright install chromium` einmalig.

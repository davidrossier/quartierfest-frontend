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

## Navigation & Routing

Main nav is split into **Stammdaten** (no event context) and three event-scoped sections. The three event sections share an `EventKontextLayoutComponent` that provides an event-selector dropdown and a sub-navigation bar.

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
- `teilnahme.model.ts` — `Teilnahme` (id, einladung, anzahlPersonenEffektiv?, hilftAufstellen?, hilftAufraumen?, buffetBeitraege: BuffetBeitragEintrag[]), `TeilnahmePayload`
- `teilnahme.service.ts` — `GET/POST/DELETE /api/teilnahmen`
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

## Backend

REST API läuft auf `http://localhost:8080`. Spezifikationen: `../quartierfest-backend/specs/`

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

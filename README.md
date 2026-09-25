# Quartierfest Frontend

Angular 21 Frontend für die Verwaltung des Quartierfests. Kommuniziert mit dem [quartierfest-backend](../quartierfest-backend) via REST.

## Voraussetzungen

- Node.js 20+
- Backend läuft auf `http://localhost:8080`

## Befehle

```bash
npm start        # Dev-Server auf http://localhost:4200 (hot reload)
npm run build    # Produktion Build (Ausgabe in dist/)
npm test         # Unit-Tests mit Vitest
npm run e2e      # Playwright-E2E (braucht laufendes Backend + npm start; in CI nächtlich via .github/workflows/e2e.yml)
npm run api:generate  # API-Typen aus ../quartierfest-backend/specs/openapi.json neu erzeugen (API-001)
npm run api:check     # dito + Fehler, wenn src/app/api/schema.d.ts vom Generat abweicht (Drift-Check der CI)
```

## Architektur

Angular 21 **Standalone**-Anwendung — keine NgModules. Jede Komponente verwendet die Standalone-API (`@Component` mit `imports`-Array).

| Datei | Zweck |
|---|---|
| `src/main.ts` | Bootstrap-Einstiegspunkt |
| `src/app/app.config.ts` | Application-Provider (HTTP, Router) |
| `src/app/app.routes.ts` | Routen-Definitionen |
| `src/app/app.html` | Root-Komponente mit Navigation und `<router-outlet>` |
| `src/styles.css` | Globale Design-Tokens und gemeinsame Komponenten-Styles |
| `src/app/api/schema.d.ts` | Generierte API-Typen (openapi-typescript, **nicht von Hand editieren**) |

## Navigationsstruktur

```
Stammdaten          → /personen, /parteien, /events
Event-Planung       → /planung  (Einladungen, Teilnahmen, Allgemeinausgaben, Konsumationsangebote, Bestätigung)
Event-Durchführung  → /durchfuehrung  (Konsumationsliste, Konsumationen)
Nachbearbeitung     → /nachbearbeitung  (Abrechnung, Inkasso)
```

Event-abhängige Routen teilen sich den `EventKontextLayoutComponent`, der den Event-Selektor einmalig anzeigt. Der gewählte Event persistiert via `EventKontextService` über alle Gruppen hinweg.

## Implementierte Features

### Stammdaten
- **UC-001 Personenverwaltung** (`/personen`) — Erfassen, Bearbeiten, Löschen
- **UC-002 Parteiverwaltung** (`/parteien`) — inkl. Personenzuordnung und Twint-Konfiguration
- **UC-003 Eventverwaltung** (`/events`) — Erfassen, Bearbeiten, Löschen

### Event-Planung (`/planung/…`)
- **UC-004 Einladungen** — Einzeln oder für alle Parteien erstellen, Rückmeldung erfassen
- **UC-005 Teilnahmen** — Aus Anmeldungen übernehmen, effektive Personenzahl erfassen
- **UC-006 Bestätigung** — Versandstatus der Einladungsbestätigungen
- **UC-007 Allgemeinausgaben** — Kosten pro Event erfassen
- **UC-008 Konsumationsangebote** — Angebote und Preise pro Event

### Event-Durchführung (`/durchfuehrung/…`)
- **UC-009 Konsumationsliste** — Druckbare Matrix (Teilnahmen × Angebote) für händische Erfassung
- **UC-010 Konsumationen** — Digitale Erfassung der Konsumationszahlen

### Nachbearbeitung (`/nachbearbeitung/…`)
- **UC-011 Abrechnung erstellen** — Automatische Berechnung (Allgemeinkosten + Konsumation pro Partei)
- **UC-012 Abrechnung zustellen** — Zustellungskanal wählen, Zustellung markieren
- **UC-013 Inkasso** — Zahlungen und Mahnungen erfassen, Offene-Posten-Übersicht

### Auth & Partei-Sicht
- **UC-014 Login** (`/login`) — Eigenbau-JWT via `POST /api/auth/login`, Token in `sessionStorage`, Guards + Interceptor, rollenbasiertes Routing (Dev-Login: `admin@quartierfest.local` / `quartierfest-admin`)
- **UC-015 Benutzerverwaltung** (`/admin/benutzer`) — Accounts anlegen, Passwort-Reset, Löschen (nur ORGANISATOR)
- **UC-016 Meine Teilnahme** (`/meine-teilnahme`) — PARTEI bestätigt/bearbeitet die eigene Teilnahme zum nächsten Event

## API-Typen (API-001)

Der API-Contract liegt als OpenAPI-Spec im Backend-Repo (`../quartierfest-backend/specs/openapi.json`, dort via Integrationstest gegen `/v3/api-docs` abgeglichen). Daraus wird `src/app/api/schema.d.ts` generiert und eingecheckt. Seit API-001 Stufe 2 liefert das Backend getrennte Request- und Response-Schemas; alle `*.model.ts` sind reine Aliase darauf (`Xxx = XxxResponse`, `XxxPayload = XxxRequest`). Requests referenzieren über flache IDs (`eventId`, `parteiId`, …), Bearbeiten läuft immer über `PUT`.

Die CI checkt `specs/openapi.json` von Backend-`main` aus und schlägt fehl, wenn das Generat nicht mehr zum eingecheckten `schema.d.ts` passt. Bei einer Contract-Änderung deshalb: Backend-PR zuerst mergen, dann hier `npm run api:generate`, Typfehler beheben, `schema.d.ts` mitcommitten.

## E2E in der CI (CI-001)

`.github/workflows/e2e.yml` führt die Playwright-Suite nächtlich (03:00 UTC) und auf Knopfdruck gegen ein echtes Backend aus: PostgreSQL-16-Service-Container, Backend-Repo auschecken und mit `./mvnw spring-boot:run` (dev-Profil) starten, Readiness über `GET /actuator/health`, dann `npm start` und `npm run e2e`. Der Playwright-Report ist als Artifact `playwright-report` abrufbar, bei Fehlern zusätzlich `server-logs`. Gegen einen Backend-Feature-Branch: `gh workflow run e2e.yml -f backend_ref=<branch>`.

## Shared Utilities

- `src/app/shared/sortierung.ts` — `createSortierung()` und `sortiereItems<T>()` für klickbare Spalten-Sortierung in allen Tabellen

## Backend-Endpunkte

REST API auf `http://localhost:8080`. Spezifikationen unter `../quartierfest-backend/specs/`.

| Ressource | Endpunkte |
|---|---|
| Personen | `GET/POST /api/persons`, `PUT /api/persons/:id`, `DELETE /api/persons/:id` |
| Parteien | `GET/POST /api/parteien`, `PUT /api/parteien/:id`, `DELETE /api/parteien/:id` |
| Events | `GET/POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id` |
| Einladungen | `GET/POST /api/einladungen`, `PUT/DELETE /api/einladungen/:id` |
| Teilnahmen | `GET/POST /api/teilnahmen`, `PUT/DELETE /api/teilnahmen/:id`, `GET /api/teilnahmen/meine` (UC-016) |
| Allgemeinausgaben | `GET/POST /api/allgemeinausgaben`, `PUT/DELETE /api/allgemeinausgaben/:id` |
| Konsumationsangebote | `GET/POST /api/konsumationsangebote`, `PUT/DELETE /api/konsumationsangebote/:id` |
| Konsumationen | `GET/POST /api/konsumationen`, `PUT/DELETE /api/konsumationen/:id` |
| Abrechnungen | `GET/POST /api/abrechnungen`, `PUT/DELETE /api/abrechnungen/:id` |
| Zahlungen | `GET/POST /api/zahlungen`, `DELETE /api/zahlungen/:id` |
| Mahnungen | `GET/POST /api/mahnungen`, `DELETE /api/mahnungen/:id` |
| Benutzer | `GET/POST /api/benutzer`, `DELETE /api/benutzer/:id`, `PUT /api/benutzer/:id/passwort` |
| Auth | `POST /api/auth/login` → `{token}` (HS256-JWT, 12 h) |

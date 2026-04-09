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
- **Eventverwaltung** (`/events`) — Erfassen, Bearbeiten, Löschen

### Event-Planung (`/planung/…`)
- **UC-003 Einladungen** — Einzeln oder für alle Parteien erstellen, Rückmeldung erfassen
- **UC-004 Teilnahmen** — Aus Anmeldungen übernehmen, effektive Personenzahl erfassen
- **UC-005 Allgemeinausgaben** — Kosten pro Event erfassen
- **UC-006 Konsumationsangebote** — Angebote und Preise pro Event
- **UC-008 Bestätigung** — Versandstatus der Einladungsbestätigungen

### Event-Durchführung (`/durchfuehrung/…`)
- **UC-009 Konsumationsliste** — Druckbare Matrix (Teilnahmen × Angebote) für händische Erfassung
- **UC-010 Konsumationen** — Digitale Erfassung der Konsumationszahlen

### Nachbearbeitung (`/nachbearbeitung/…`)
- **UC-011 Abrechnung erstellen** — Automatische Berechnung (Allgemeinkosten + Konsumation pro Partei)
- **UC-012 Abrechnung zustellen** — Zustellungskanal wählen, Zustellung markieren
- **UC-013 Inkasso** — Zahlungen und Mahnungen erfassen, Offene-Posten-Übersicht

## Shared Utilities

- `src/app/shared/sortierung.ts` — `createSortierung()` und `sortiereItems<T>()` für klickbare Spalten-Sortierung in allen Tabellen

## Backend-Endpunkte

REST API auf `http://localhost:8080`. Spezifikationen unter `../quartierfest-backend/specs/`.

| Ressource | Endpunkte |
|---|---|
| Personen | `GET/POST /api/persons`, `DELETE /api/persons/:id` |
| Parteien | `GET/POST /api/parteien`, `PUT /api/parteien/:id`, `DELETE /api/parteien/:id` |
| Events | `GET/POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id` |
| Einladungen | `GET/POST /api/einladungen`, `DELETE /api/einladungen/:id` |
| Teilnahmen | `GET/POST /api/teilnahmen`, `DELETE /api/teilnahmen/:id` |
| Allgemeinausgaben | `GET/POST /api/allgemeinausgaben`, `DELETE /api/allgemeinausgaben/:id` |
| Konsumationsangebote | `GET/POST /api/konsumationsangebote`, `DELETE /api/konsumationsangebote/:id` |
| Konsumationen | `GET/POST /api/konsumationen`, `DELETE /api/konsumationen/:id` |
| Abrechnungen | `GET/POST /api/abrechnungen`, `DELETE /api/abrechnungen/:id` |
| Zahlungen | `GET/POST /api/zahlungen`, `DELETE /api/zahlungen/:id` |
| Mahnungen | `GET/POST /api/mahnungen`, `DELETE /api/mahnungen/:id` |

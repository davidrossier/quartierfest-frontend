---
name: playwright-test-creator
description: >
  Erstellt Playwright E2E-Testdateien (.spec.ts) für das Quartierfest-Frontend (Angular 21 Standalone).
  Liest Use-Case-Spezifikationen aus ../quartierfest-backend/specs/, leitet daraus testbare
  Szenarien ab und schreibt strukturierte .spec.ts-Dateien mit vollständiger Traceability
  (UC-ID in Kommentaren, describe/test-Hierarchie, Page Object Model).
  Verwende diesen Skill immer wenn: Playwright-Tests erstellt oder ergänzt werden sollen,
  Traceability zwischen Tests und Use Cases geprüft wird, neue UC-Specs in Tests überführt
  werden, oder wenn der User fragt ob alle Use Cases durch Tests abgedeckt sind.
---

# Playwright Test Creator — Quartierfest Frontend

Du bist ein erfahrener Frontend-Testingenieur mit Schwerpunkt Angular und Playwright.
Deine Aufgabe ist es, aus den Use-Case-Spezifikationen des Quartierfest-Projekts
strukturierte, wartbare Playwright-Testdateien zu erzeugen.

---

## Architektur-Entscheid: Page Object Model (POM)

Verwende immer das **Page Object Model**:
- Eine POM-Klasse pro Seite/Feature (z.B. `PersonenPage`, `ParteienPage`)
- POM-Dateien liegen in `e2e/pages/`
- Spec-Dateien liegen in `e2e/specs/`
- Gemeinsame Helpers in `e2e/helpers/`

**Begründung**: Das Angular-Standalone-Frontend hat klare Routen pro Feature (siehe README).
POM macht Selektoren wartbar wenn Angular-Templates sich ändern, und hält die
spec-Dateien lesbar und fokussiert auf Verhalten.

Dateistruktur:
```
e2e/
├── pages/
│   ├── personen.page.ts
│   ├── parteien.page.ts
│   ├── events.page.ts
│   ├── planung/
│   │   ├── einladungen.page.ts
│   │   ├── teilnahmen.page.ts
│   │   └── ...
│   └── nachbearbeitung/
│       └── ...
├── specs/
│   ├── UC-001_Personenverwaltung.spec.ts
│   ├── UC-002_Parteiverwaltung.spec.ts
│   └── ...
└── helpers/
    ├── test-data.ts       # Fixture-Factories
    └── api-helpers.ts     # Backend-Setup via API calls
```

---

## Schritt 1 — Use Cases lesen

Lese alle Markdown-Dateien in `../quartierfest-backend/specs/`.
Suche nach Dateien mit UC-IDs (`UC-XXX`).

Für jede UC-Datei extrahiere:
- **UC-ID** und **Name**
- **Hauptfluss** (Happy Path)
- **Alternativ- / Fehlerflüsse**
- **Vorbedingungen** (relevant für Test-Setup)
- **Gherkin-Szenarien** (falls vorhanden — direkt in `test()`-Namen überführen)
- **Betroffene Route** (aus README ableiten, z.B. UC-001 → `/personen`)

Erstelle intern eine Mapping-Tabelle:

| UC-ID | Name | Route | Szenarien (Happy + Error) | POM-Klasse |
|---|---|---|---|---|

Falls `../quartierfest-backend/specs/` nicht erreichbar ist: frage den User nach dem
korrekten Pfad oder ob die Specs im aktuellen Repo liegen.

---

## Schritt 2 — Lücken identifizieren

Prüfe, ob im Verzeichnis `e2e/specs/` bereits `.spec.ts`-Dateien existieren.
Falls ja: scanne deren Header-Kommentare auf `@uc` oder `// UC-` Tags und
erstelle eine **Coverage-Übersicht**:

```
UC-001  ✅ abgedeckt   (e2e/specs/UC-001_Personenverwaltung.spec.ts)
UC-002  ✅ abgedeckt
UC-003  ❌ fehlt
UC-004  ⚠️  teilweise   (nur Happy Path, keine Fehlerfälle)
```

Teile diese Übersicht dem User mit und frage, welche UCs generiert werden sollen,
bevor du mit Schritt 3 anfängst — ausser der User hat bereits eine klare Angabe gemacht.

---

## Schritt 3 — POM-Klassen erzeugen (falls noch nicht vorhanden)

Für jede betroffene Seite, die noch kein POM hat, erzeuge die Page-Klasse.
Lese dafür zuerst die Referenz: `references/pom-template.md`

**Wichtige Angular-Selektoren-Regeln:**
- Bevorzuge `data-testid`-Attribute (falls vorhanden, sonst `getByRole` / `getByLabel`)
- Vermeide CSS-Klassen und interne Angular-Attribute (`_ngcontent-*`)
- Formularfelder: `page.getByLabel('Vorname')` statt CSS-Selektor
- Buttons: `page.getByRole('button', { name: 'Speichern' })`
- Tabellen-Zeilen: `page.getByRole('row').filter({ hasText: name })`

---

## Schritt 4 — Spec-Dateien erzeugen

Für jede UC eine `.spec.ts`-Datei nach folgendem Muster.
Lese zuerst die Referenz: `references/spec-template.md`

**Pflicht-Header in jeder Spec-Datei:**
```typescript
/**
 * @uc UC-XXX
 * @name <UC-Name aus Spec>
 * @route <Angular-Route>
 * @spec ../quartierfest-backend/specs/<Dateiname>.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  <Szenario 1>
 *  - [HAPPY]  <Szenario 2>
 *  - [ERROR]  <Fehlerszenario 1>
 *  - [EDGE]   <Grenzfall>
 */
```

**describe/test-Hierarchie:**
```typescript
describe('UC-XXX — <UC-Name>', () => {
  describe('Happy Path', () => {
    test('<exakt der Szenario-Name aus der Spec>')
  })
  describe('Fehlerfälle', () => {
    test('<Fehlerszenario>')
  })
  describe('Grenzfälle', () => {
    test('<Grenzfall — optional>')
  })
})
```

**Test-Setup-Strategie:**
- Vorbedingungen (existierende Personen, Parteien etc.) immer via **API-Call** im
  `beforeEach` aufbauen, nicht über die UI — das hält Tests unabhängig und schnell
- Backend läuft auf `http://localhost:8080` (aus README)
- Nutze `api-helpers.ts` für wiederverwendbare Setup-Funktionen

---

## Schritt 5 — Traceability sicherstellen

Nach dem Erzeugen aller Dateien: generiere oder aktualisiere
`e2e/TRACEABILITY.md` mit folgender Tabelle:

```markdown
# Playwright Traceability Matrix
_Automatisch generiert — nicht manuell editieren_

| UC-ID | UC-Name | Spec-Datei | Szenarien | Status |
|---|---|---|---|---|
| UC-001 | Personenverwaltung | specs/UC-001_Personenverwaltung.spec.ts | 4 Happy, 2 Error | ✅ vollständig |
| UC-002 | Parteiverwaltung | specs/UC-002_Parteiverwaltung.spec.ts | 3 Happy, 1 Error | ✅ vollständig |
| UC-003 | Einladungen | — | — | ❌ fehlt |
```

**Status-Werte:**
- `✅ vollständig` — alle Szenarien aus der Spec abgedeckt
- `⚠️ teilweise` — Happy Path vorhanden, Fehlerfälle fehlen
- `❌ fehlt` — keine Testdatei vorhanden
- `🔧 veraltet` — Spec wurde geändert, Tests müssen aktualisiert werden

---

## Schritt 6 — Zusammenfassung ausgeben

Gib am Ende eine kompakte Zusammenfassung aus:

```
Erstellt:
  e2e/pages/personen.page.ts
  e2e/specs/UC-001_Personenverwaltung.spec.ts
  e2e/TRACEABILITY.md

Coverage nach diesem Lauf:
  UC-001  ✅   UC-002  ✅   UC-003  ❌   ...

Empfehlungen:
  - UC-003 bis UC-013 noch nicht abgedeckt
  - data-testid-Attribute in PersonenComponent noch nicht gesetzt (Selektoren
    fallen auf getByLabel zurück — prüfen ob Labels stabil sind)
```

---

## Qualitätsregeln (immer einhalten)

1. **Keine `page.waitForTimeout()`** — nutze `expect(locator).toBeVisible()` o.ä.
2. **Keine hardcodierten IDs** aus der Datenbank — IDs immer aus API-Response lesen
3. **Jeder Test ist isoliert** — `beforeEach` baut seinen eigenen State auf
4. **Assertions sind spezifisch** — `toHaveText('Max Muster')` statt `toBeTruthy()`
5. **Deutsche Testnamen** — konsistent mit der Ubiquitous Language der Specs
6. **API-Cleanup in `afterEach`** wenn persistente Daten angelegt wurden

---

## Referenzdateien

Lese diese Dateien wenn du Templates brauchst:
- `references/pom-template.md` — Vorlage und Regeln für Page Object Model Klassen
- `references/spec-template.md` — Vollständige Vorlage für eine .spec.ts-Datei
- `references/api-helpers-template.md` — Vorlage für Backend-Setup-Helpers

# Spec-Datei — Vollständige Vorlage

## Dateiname-Konvention

`e2e/specs/UC-XXX_<SlugAusDerSpec>.spec.ts`

Beispiele:
- `UC-001_Personenverwaltung.spec.ts`
- `UC-011_Abrechnung-Erstellen.spec.ts`

## Vollständige Vorlage

```typescript
/**
 * @uc UC-XXX
 * @name <UC-Name exakt wie in der Spec>
 * @route /<angular-route>
 * @spec ../quartierfest-backend/specs/<dateiname>.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  <Szenario-Name aus Gherkin/Hauptfluss>
 *  - [HAPPY]  <weiteres Happy-Path-Szenario>
 *  - [ERROR]  <Fehlerszenario aus Spec>
 *  - [EDGE]   <Grenzfall, falls relevant>
 *
 * Nicht abgedeckt (Begründung):
 *  - <Szenario> — <warum: z.B. "benötigt E-Mail-Integration, Out of Scope">
 */
import { test, expect } from '@playwright/test';
import { <FeatureName>Page } from '../pages/<feature>.page';
import { createTestPerson, createTestEvent, deleteTestData } from '../helpers/api-helpers';

// Typ für Test-Fixtures
type TestFixtures = {
  // Hier Objekte eintragen die in beforeEach erstellt werden
};

test.describe('UC-XXX — <UC-Name>', () => {
  let featurePage: <FeatureName>Page;
  let testDaten: TestFixtures;

  test.beforeEach(async ({ page }) => {
    featurePage = new <FeatureName>Page(page);

    // State via API aufbauen (nicht via UI)
    testDaten = {
      // person: await createTestPerson({ vorname: 'Test', nachname: 'Person' }),
    };

    await featurePage.goto();
  });

  test.afterEach(async () => {
    // Cleanup wenn nötig
    // await deleteTestData(testDaten);
  });

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {

    test('<Szenario-Name exakt aus Spec — deutsch>', async () => {
      // Arrange
      // (State wurde in beforeEach via API aufgebaut)

      // Act
      await featurePage.neuerEintragFormularOeffnen();
      await featurePage.formularAusfuellen({
        vorname: 'Max',
        nachname: 'Muster',
      });
      await featurePage.speichern();

      // Assert
      await featurePage.eintragInTabelleErwarten('Max Muster');
      await expect(featurePage.erfolgsMeldung).toBeVisible();
    });

  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {

    test('Pflichtfeld fehlt — Validierungsfehler wird angezeigt', async () => {
      // Arrange
      await featurePage.neuerEintragFormularOeffnen();

      // Act — Speichern ohne Pflichtfeld
      await featurePage.speichern();

      // Assert
      await expect(featurePage.fehlerMeldung).toBeVisible();
      // Formular bleibt offen
      await expect(featurePage.btnSpeichern).toBeVisible();
    });

  });

  // ================================================================
  // Grenzfälle (optional, nur wenn in Spec definiert)
  // ================================================================
  // test.describe('Grenzfälle', () => {
  //   test('...')
  // });

});
```

## Regeln für test()-Namen

- **Deutsch** — konsistent mit der Ubiquitous Language des Projekts
- **Verhalten beschreiben**, nicht Implementierung:
  - ✅ `'Person wird in der Tabelle angezeigt'`
  - ❌ `'POST /api/persons gibt 201 zurück'`
- **Fehlerfälle benennen was schiefläuft**:
  - ✅ `'Pflichtfeld fehlt — Formular zeigt Validierungsfehler'`
  - ❌ `'Test Fehlerfall'`
- Gherkin-Szenario-Namen aus der Spec direkt übernehmen wenn vorhanden

## Assertions-Referenz

```typescript
// Element sichtbar
await expect(locator).toBeVisible();

// Text-Inhalt
await expect(locator).toHaveText('Erwarteter Text');
await expect(locator).toContainText('Teiltext');

// Anzahl Zeilen in Tabelle
await expect(tabelle.getByRole('row')).toHaveCount(4); // inkl. Header-Zeile

// URL nach Navigation
await expect(page).toHaveURL(/\/personen/);

// Formular-Wert
await expect(input).toHaveValue('Max');

// Element nicht vorhanden
await expect(locator).not.toBeVisible();
await expect(locator).toHaveCount(0);

// Deaktivierter Button
await expect(button).toBeDisabled();
```

## Kein `waitForTimeout` — stattdessen:

```typescript
// ❌ Falsch
await page.waitForTimeout(2000);

// ✅ Richtig — warte auf konkreten Zustand
await expect(successAlert).toBeVisible();
await expect(page).toHaveURL('/personen');
await expect(tabelle.getByRole('row')).toHaveCount(3);
```

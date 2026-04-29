# Page Object Model — Vorlage und Regeln

## Basis-Template

```typescript
import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object für <FeatureName>
 * Route: /<route>
 * Verwendete UCs: UC-XXX, UC-YYY
 */
export class <FeatureName>Page {
  readonly page: Page;

  // --- Navigations-Locators ---
  readonly heading: Locator;

  // --- Formular-Locators ---
  readonly inputVorname: Locator;
  readonly inputNachname: Locator;
  readonly btnSpeichern: Locator;
  readonly btnAbbrechen: Locator;

  // --- Tabellen-Locators ---
  readonly tabelle: Locator;
  readonly btnNeuErstellen: Locator;

  // --- Feedback-Locators ---
  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { level: 1 });

    this.inputVorname = page.getByLabel('Vorname');
    this.inputNachname = page.getByLabel('Nachname');
    this.btnSpeichern = page.getByRole('button', { name: 'Speichern' });
    this.btnAbbrechen = page.getByRole('button', { name: 'Abbrechen' });

    this.tabelle = page.getByRole('table');
    this.btnNeuErstellen = page.getByRole('button', { name: /neu|erstellen|hinzufügen/i });

    this.erfolgsMeldung = page.getByRole('alert').filter({ hasText: /erfolgreich/i });
    this.fehlerMeldung = page.getByRole('alert').filter({ hasText: /fehler|ungültig/i });
  }

  // --- Navigation ---
  async goto() {
    await this.page.goto('/<route>');
    await expect(this.heading).toBeVisible();
  }

  // --- Aktionen ---
  async neuerEintragFormularOeffnen() {
    await this.btnNeuErstellen.click();
    await expect(this.inputVorname).toBeVisible();
  }

  async formularAusfuellen(daten: { vorname: string; nachname: string }) {
    await this.inputVorname.fill(daten.vorname);
    await this.inputNachname.fill(daten.nachname);
  }

  async speichern() {
    await this.btnSpeichern.click();
  }

  async eintragInTabelleErwarten(text: string) {
    await expect(
      this.tabelle.getByRole('row').filter({ hasText: text })
    ).toBeVisible();
  }

  async eintragLoeschen(text: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: text });
    await zeile.getByRole('button', { name: /löschen|entfernen/i }).click();
    // Bestätigungsdialog falls vorhanden:
    const dialog = this.page.getByRole('dialog');
    if (await dialog.isVisible()) {
      await dialog.getByRole('button', { name: /bestätigen|ja|löschen/i }).click();
    }
  }
}
```

## Regeln für Selektoren (Prioritätsreihenfolge)

1. `data-testid="..."` — stabilste Option, explizit für Tests gesetzt
2. `getByRole(...)` mit `name` — semantisch korrekt, stabil bei Refactoring
3. `getByLabel(...)` — für Formularfelder, nutzt ARIA-Labels
4. `getByText(...)` — nur für nicht-interaktive Inhalte
5. `getByPlaceholder(...)` — Fallback wenn kein Label vorhanden
6. CSS-Selektor — nur als letzter Ausweg, nie mit Angular-internen Attributen

## Event-Kontext (Angular `EventKontextService`)

Manche Seiten benötigen einen ausgewählten Event. Setup im `beforeEach`:

```typescript
// Entweder via UI (Event-Selektor):
const eventSelector = page.getByRole('combobox', { name: /event/i });
await eventSelector.selectOption({ label: testEvent.name });

// Oder direkter API-Aufruf + localStorage (schneller):
await page.evaluate((eventId) => {
  localStorage.setItem('selectedEventId', String(eventId));
}, testEvent.id);
await page.reload();
```

## Mehrfach-Navigationsgruppen (Layout-Komponente)

Der `EventKontextLayoutComponent` wrапpt alle Event-abhängigen Routen.
Beim ersten Aufruf dieser Routen immer sicherstellen:

```typescript
async gotoMitEventKontext(eventId: number) {
  await this.page.goto('/planung/einladungen');
  // Warten bis Event-Selektor sichtbar
  const selektor = this.page.getByTestId('event-selektor');
  if (await selektor.isVisible()) {
    await selektor.selectOption(String(eventId));
  }
}
```

import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object für Eventverwaltung
 * Route: /events
 * Verwendete UCs: UC-003
 */
export class EventsPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;

  readonly inputDatum: Locator;
  readonly inputStartzeit: Locator;
  readonly inputStandort: Locator;
  readonly inputAlternativerStandort: Locator;
  readonly btnSpeichern: Locator;
  readonly btnAbbrechen: Locator;

  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;
  readonly feldFehler: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Eventverwaltung' });
    this.tabelle = page.getByRole('table');

    this.inputDatum = page.getByLabel('Datum *');
    this.inputStartzeit = page.getByLabel('Startzeit *');
    this.inputStandort = page.getByLabel('Standort *');
    this.inputAlternativerStandort = page.getByLabel('Alternativer Standort');
    this.btnSpeichern = page.getByRole('button', { name: 'Speichern' });
    this.btnAbbrechen = page.getByRole('button', { name: 'Abbrechen' });

    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
    this.feldFehler = page.locator('.feldFehler');
  }

  async goto() {
    await this.page.goto('/events');
    await expect(this.heading).toBeVisible();
  }

  async formularAusfuellen(daten: {
    datum: string;
    startzeit: string;
    standort: string;
    alternativerStandort?: string;
  }) {
    await this.inputDatum.fill(daten.datum);
    await this.inputStartzeit.fill(daten.startzeit);
    await this.inputStandort.fill(daten.standort);
    if (daten.alternativerStandort) {
      await this.inputAlternativerStandort.fill(daten.alternativerStandort);
    }
  }

  async speichern() {
    await this.btnSpeichern.click();
  }

  async eventInTabelleErwarten(standort: string) {
    await expect(this.tabelle.getByRole('row').filter({ hasText: standort })).toBeVisible();
  }

  async bearbeiten(standort: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: standort });
    await zeile.getByRole('button', { name: 'Bearbeiten' }).click();
  }

  async loeschen(standort: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: standort });
    this.page.once('dialog', (d) => d.accept());
    await zeile.getByRole('button', { name: 'Löschen' }).click();
  }
}

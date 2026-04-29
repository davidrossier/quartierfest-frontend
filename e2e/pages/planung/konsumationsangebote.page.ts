import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Konsumationsangebote
 * Route: /planung/konsumationsangebote
 * Verwendete UCs: UC-008
 */
export class KonsumationsangebotePage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;
  readonly leerhinweis: Locator;

  readonly inputBezeichnung: Locator;
  readonly inputPreis: Locator;
  readonly btnSpeichern: Locator;
  readonly btnAbbrechen: Locator;

  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;
  readonly feldFehler: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Konsumationsangebote' });
    this.tabelle = page.getByRole('table');
    this.leerhinweis = page.locator('.leerhinweis');

    this.inputBezeichnung = page.getByLabel('Bezeichnung *');
    this.inputPreis = page.getByLabel('Preis (CHF) *');
    this.btnSpeichern = page.getByRole('button', { name: 'Speichern' });
    this.btnAbbrechen = page.getByRole('button', { name: 'Abbrechen' });

    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
    this.feldFehler = page.locator('.feldFehler');
  }

  async goto(eventId: number) {
    await this.page.goto('/planung/konsumationsangebote');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async formularAusfuellen(daten: { bezeichnung: string; preis: number }) {
    await this.inputBezeichnung.fill(daten.bezeichnung);
    await this.inputPreis.fill(String(daten.preis));
  }

  async speichern() {
    await this.btnSpeichern.click();
  }

  async angebotInTabelleErwarten(bezeichnung: string) {
    await expect(this.tabelle.getByRole('row').filter({ hasText: bezeichnung })).toBeVisible();
  }

  async loeschen(bezeichnung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: bezeichnung });
    this.page.once('dialog', (d) => d.accept());
    await zeile.getByRole('button', { name: 'Löschen' }).click();
  }
}

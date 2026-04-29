import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object für Personenverwaltung
 * Route: /personen
 * Verwendete UCs: UC-001
 */
export class PersonenPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;
  readonly leerhinweis: Locator;

  readonly inputVorname: Locator;
  readonly inputName: Locator;
  readonly inputMobilenummer: Locator;
  readonly inputEmail: Locator;
  readonly btnSpeichern: Locator;
  readonly btnAbbrechen: Locator;

  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;
  readonly feldFehler: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Personenverwaltung' });
    this.tabelle = page.getByRole('table');
    this.leerhinweis = page.locator('.leerhinweis');

    this.inputVorname = page.getByLabel('Vorname *');
    this.inputName = page.getByLabel('Name *', { exact: true });
    this.inputMobilenummer = page.getByLabel('Mobilenummer');
    this.inputEmail = page.getByLabel('E-Mail');
    this.btnSpeichern = page.getByRole('button', { name: 'Speichern' });
    this.btnAbbrechen = page.getByRole('button', { name: 'Abbrechen' });

    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
    this.feldFehler = page.locator('.feldFehler');
  }

  async goto() {
    await this.page.goto('/personen');
    await expect(this.heading).toBeVisible();
  }

  async formularAusfuellen(daten: { vorname: string; name: string; mobilenummer?: string }) {
    await this.inputVorname.fill(daten.vorname);
    await this.inputName.fill(daten.name);
    if (daten.mobilenummer) {
      await this.inputMobilenummer.fill(daten.mobilenummer);
    }
  }

  async speichern() {
    await this.btnSpeichern.click();
  }

  async personInTabelleErwarten(vollname: string) {
    await expect(this.tabelle.getByRole('row').filter({ hasText: vollname }).first()).toBeVisible();
  }

  async personNichtInTabelle(vollname: string) {
    await expect(this.tabelle.getByRole('row').filter({ hasText: vollname })).toHaveCount(0);
  }

  async bearbeiten(vollname: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: vollname }).first();
    await zeile.getByRole('button', { name: 'Bearbeiten' }).click();
  }

  async loeschen(vollname: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: vollname }).first();
    this.page.once('dialog', (d) => d.accept());
    await zeile.getByRole('button', { name: 'Löschen' }).click();
  }
}

import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object für Parteiverwaltung
 * Route: /parteien
 * Verwendete UCs: UC-002
 */
export class ParteienPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;

  readonly inputBezeichnung: Locator;
  readonly inputAdresse: Locator;
  readonly checkboxTwintAktiv: Locator;
  readonly inputTwintMobilenummer: Locator;
  readonly btnSpeichern: Locator;
  readonly btnAbbrechen: Locator;

  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;
  readonly feldFehler: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Parteiverwaltung' });
    this.tabelle = page.getByRole('table');

    this.inputBezeichnung = page.getByLabel('Bezeichnung *');
    this.inputAdresse = page.getByLabel('Adresse *');
    this.checkboxTwintAktiv = page.getByLabel('Twint aktiv');
    this.inputTwintMobilenummer = page.getByLabel('Twint-Mobilenummer');
    this.btnSpeichern = page.getByRole('button', { name: 'Speichern' });
    this.btnAbbrechen = page.getByRole('button', { name: 'Abbrechen' });

    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
    this.feldFehler = page.locator('.feldFehler');
  }

  async goto() {
    await this.page.goto('/parteien');
    await expect(this.heading).toBeVisible();
  }

  async formularAusfuellen(daten: {
    bezeichnung: string;
    adresse: string;
    twintAktiv?: boolean;
    twintMobilenummer?: string;
  }) {
    await this.inputBezeichnung.fill(daten.bezeichnung);
    await this.inputAdresse.fill(daten.adresse);
    if (daten.twintAktiv) {
      await this.checkboxTwintAktiv.check();
      if (daten.twintMobilenummer) {
        await this.inputTwintMobilenummer.fill(daten.twintMobilenummer);
      }
    }
  }

  async personAuswaehlen(vollname: string) {
    await this.page.getByLabel(vollname).check();
  }

  async speichern() {
    await this.btnSpeichern.click();
  }

  async parteiInTabelleErwarten(bezeichnung: string) {
    await expect(this.tabelle.getByRole('row').filter({ hasText: bezeichnung })).toBeVisible();
  }

  async bearbeiten(bezeichnung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: bezeichnung }).first();
    await zeile.getByRole('button', { name: 'Bearbeiten' }).click();
  }

  async loeschen(bezeichnung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: bezeichnung }).first();
    this.page.once('dialog', (d) => d.accept());
    await zeile.getByRole('button', { name: 'Löschen' }).click();
  }
}

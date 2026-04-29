import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Allgemeinausgaben
 * Route: /planung/allgemeinausgaben
 * Verwendete UCs: UC-007
 */
export class AllgemeinausgabenPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;
  readonly leerhinweis: Locator;

  readonly inputBeschreibung: Locator;
  readonly inputBetrag: Locator;
  readonly inputHerkunft: Locator;
  readonly btnSpeichern: Locator;
  readonly btnAbbrechen: Locator;

  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;
  readonly feldFehler: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Allgemeinausgaben' });
    this.tabelle = page.getByRole('table');
    this.leerhinweis = page.locator('.leerhinweis');

    this.inputBeschreibung = page.getByLabel('Beschreibung *');
    this.inputBetrag = page.getByLabel('Betrag (CHF) *');
    this.inputHerkunft = page.getByLabel('Herkunft');
    this.btnSpeichern = page.getByRole('button', { name: 'Speichern' });
    this.btnAbbrechen = page.getByRole('button', { name: 'Abbrechen' });

    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
    this.feldFehler = page.locator('.feldFehler');
  }

  async goto(eventId: number) {
    await this.page.goto('/planung/allgemeinausgaben');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async formularAusfuellen(daten: {
    beschreibung: string;
    betrag: number;
    herkunft?: string;
  }) {
    await this.inputBeschreibung.fill(daten.beschreibung);
    await this.inputBetrag.fill(String(daten.betrag));
    if (daten.herkunft) {
      await this.inputHerkunft.fill(daten.herkunft);
    }
  }

  async speichern() {
    await this.btnSpeichern.click();
  }

  async ausgabeInTabelleErwarten(beschreibung: string) {
    await expect(this.tabelle.getByRole('row').filter({ hasText: beschreibung })).toBeVisible();
  }

  async gesamtbetragErwarten(betragText: string) {
    await expect(this.page.locator('.gesamt-zeile')).toContainText(betragText);
  }

  async loeschen(beschreibung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: beschreibung });
    this.page.once('dialog', (d) => d.accept());
    await zeile.getByRole('button', { name: 'Löschen' }).click();
  }
}

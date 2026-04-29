import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Abrechnungsverwaltung
 * Route: /nachbearbeitung/abrechnungen
 * Verwendete UCs: UC-011, UC-012
 */
export class AbrechnungenPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;
  readonly btnAbrechnungenErstellen: Locator;
  readonly btnNeuBerechnen: Locator;
  readonly leerhinweis: Locator;
  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Abrechnungen' });
    this.tabelle = page.getByRole('table');
    this.btnAbrechnungenErstellen = page.getByRole('button', { name: 'Abrechnungen erstellen' });
    this.btnNeuBerechnen = page.getByRole('button', { name: 'Neu berechnen' });
    this.leerhinweis = page.locator('.leerhinweis');
    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
  }

  async goto(eventId: number) {
    await this.page.goto('/nachbearbeitung/abrechnungen');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async abrechnungenErstellen() {
    await this.btnAbrechnungenErstellen.click();
    await expect(this.tabelle).toBeVisible({ timeout: 10000 });
  }

  async parteiInTabelleErwarten(parteiBezeichnung: string) {
    await expect(
      this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung }),
    ).toBeVisible();
  }

  async kanalAendern(parteiBezeichnung: string, kanal: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await zeile.locator('select.kanal-select').selectOption(kanal);
    await zeile.getByRole('button', { name: 'Speichern' }).click();
  }

  async alsZugestelltMarkieren(parteiBezeichnung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await zeile.getByRole('button', { name: 'Als zugestellt markieren' }).click();
  }

  async zustellungsDatumErwarten(parteiBezeichnung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await expect(zeile.locator('.badge.badge--success')).toBeVisible();
  }

  async abrechnungsbetragErwarten(parteiBezeichnung: string, betrag: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await expect(zeile.locator('.total-betrag')).toContainText(betrag);
  }
}

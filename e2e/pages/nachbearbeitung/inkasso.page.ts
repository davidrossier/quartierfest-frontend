import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Inkasso-Verwaltung
 * Route: /nachbearbeitung/inkasso
 * Verwendete UCs: UC-013
 */
export class InkassoPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;
  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Inkasso' });
    this.tabelle = page.locator('.inkasso-tabelle');
    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
  }

  async goto(eventId: number) {
    await this.page.goto('/nachbearbeitung/inkasso');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async detailsOeffnen(parteiBezeichnung: string) {
    const zeile = this.tabelle.getByRole('row', { name: /haupt-zeile/ }).filter({ hasText: parteiBezeichnung });
    await zeile.getByRole('button', { name: 'Details' }).click();
  }

  async parteiZeileDetails(parteiBezeichnung: string): Promise<Locator> {
    const hauptZeile = this.tabelle.locator('.haupt-zeile').filter({ hasText: parteiBezeichnung });
    await hauptZeile.getByRole('button', { name: 'Details' }).click();
    return this.page.locator('.detail-panel');
  }

  async zahlungFormOeffnen(parteiBezeichnung: string) {
    const detail = await this.parteiZeileDetails(parteiBezeichnung);
    await detail.getByRole('button', { name: 'Zahlung erfassen' }).click();
  }

  async zahlungErfassen(daten: {
    parteiBezeichnung: string;
    kanal?: string;
    datum: string;
    betrag: number;
  }) {
    await this.zahlungFormOeffnen(daten.parteiBezeichnung);
    const detail = this.page.locator('.detail-panel');
    if (daten.kanal) {
      await detail.getByLabel('Kanal *').selectOption(daten.kanal);
    }
    await detail.getByLabel('Datum *').fill(daten.datum);
    await detail.getByLabel('Betrag (CHF) *').fill(String(daten.betrag));
    await detail.getByRole('button', { name: 'Speichern' }).click();
  }

  async mahnungFormOeffnen(parteiBezeichnung: string) {
    const detail = await this.parteiZeileDetails(parteiBezeichnung);
    await detail.getByRole('button', { name: 'Mahnung erfassen' }).click();
  }

  async mahnungErfassen(daten: { parteiBezeichnung: string; datum: string; bemerkung?: string }) {
    await this.mahnungFormOeffnen(daten.parteiBezeichnung);
    const detail = this.page.locator('.detail-panel');
    await detail.getByLabel('Datum *').fill(daten.datum);
    if (daten.bemerkung) {
      await detail.getByLabel('Bemerkung').fill(daten.bemerkung);
    }
    await detail.getByRole('button', { name: 'Speichern' }).click();
  }

  async offenenBetragErwarten(parteiBezeichnung: string, betragText: string) {
    const zeile = this.tabelle.locator('.haupt-zeile').filter({ hasText: parteiBezeichnung });
    const offenZelle = zeile.locator('.offen-null, .offen-positiv');
    await expect(offenZelle).toContainText(betragText);
  }

  async zahlungsstatusErwarten(parteiBezeichnung: string, status: 'Bezahlt' | 'Teilzahlung' | 'Offen') {
    const zeile = this.tabelle.locator('.haupt-zeile').filter({ hasText: parteiBezeichnung });
    await expect(zeile).toContainText(status);
  }
}

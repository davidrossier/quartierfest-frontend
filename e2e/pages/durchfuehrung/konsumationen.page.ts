import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Konsumationsverwaltung (Matrix-Eingabe)
 * Route: /durchfuehrung/konsumationen
 * Verwendete UCs: UC-010
 */
export class KonsumationenPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;
  readonly btnSpeichern: Locator;
  readonly warnungKeinAngebot: Locator;
  readonly warnungKeineTeilnahmen: Locator;
  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Konsumationen erfassen' });
    this.tabelle = page.locator('.konsumations-tabelle');
    this.btnSpeichern = page.getByRole('button', { name: 'Speichern' });
    this.warnungKeinAngebot = page
      .locator('.alert.alert--warning')
      .filter({ hasText: /kein.*angebot/i });
    this.warnungKeineTeilnahmen = page
      .locator('.alert.alert--warning')
      .filter({ hasText: /keine.*teilnahmen/i });
    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
  }

  async goto(eventId: number) {
    await this.page.goto('/durchfuehrung/konsumationen');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async anzahlEingeben(parteiBezeichnung: string, angebotSpalteIndex: number, anzahl: number) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    const inputs = zeile.locator('.anzahl-input');
    await inputs.nth(angebotSpalteIndex).fill(String(anzahl));
  }

  async speichern() {
    await this.btnSpeichern.click();
  }

  async totalFuerParteiErwarten(parteiBezeichnung: string, totalText: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await expect(zeile.locator('.total-zelle')).toContainText(totalText);
  }
}

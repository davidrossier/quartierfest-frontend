import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Bestätigungsübersicht
 * Route: /planung/bestaetigung
 * Verwendete UCs: UC-006
 */
export class BestaetigungPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly warnungKeinAngebot: Locator;
  readonly btnAlleMarkieren: Locator;
  readonly tabelle: Locator;
  readonly erfolgsMeldung: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Bestätigung versenden' });
    this.warnungKeinAngebot = page
      .locator('.alert.alert--warning')
      .filter({ hasText: /kein Konsumationsangebot/i });
    this.btnAlleMarkieren = page.getByRole('button', { name: /Alle als versendet markieren/ });
    this.tabelle = page.getByRole('table');
    this.erfolgsMeldung = page.locator('.alert.alert--success');
  }

  async goto(eventId: number) {
    await this.page.goto('/planung/bestaetigung');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async einzelnAlsVersendetMarkieren(parteiBezeichnung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await zeile.getByRole('button', { name: 'Als versendet markieren' }).click();
  }

  async alleAlsVersendetMarkieren() {
    await this.btnAlleMarkieren.click();
  }

  async bestaetigungStatusErwarten(parteiBezeichnung: string, status: 'Versendet' | 'Ausstehend') {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await expect(zeile).toContainText(status);
  }
}

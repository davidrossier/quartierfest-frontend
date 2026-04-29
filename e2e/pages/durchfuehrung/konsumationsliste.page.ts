import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Konsumationsliste
 * Route: /durchfuehrung/konsumationsliste
 * Verwendete UCs: UC-009
 */
export class KonsumationslistePage {
  readonly page: Page;

  readonly heading: Locator;
  readonly warnungKeinAngebot: Locator;
  readonly warnungKeineTeilnahmen: Locator;
  readonly tabelle: Locator;
  readonly btnDrucken: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { level: 1 });
    this.warnungKeinAngebot = page.locator('.alert, .leerhinweis').filter({
      hasText: /kein.*angebot/i,
    });
    this.warnungKeineTeilnahmen = page.locator('.alert.alert--warning').filter({
      hasText: /keine.*teilnahmen/i,
    });
    this.tabelle = page.getByRole('table');
    this.btnDrucken = page.getByRole('button', { name: /drucken/i });
  }

  async goto(eventId: number) {
    await this.page.goto('/durchfuehrung/konsumationsliste');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async tabellenZeilenAnzahl(): Promise<number> {
    const rows = this.tabelle.getByRole('row');
    return (await rows.count()) - 1;
  }

  async tabellenSpaltenAnzahl(): Promise<number> {
    const headerRow = this.tabelle.getByRole('row').first();
    return await headerRow.getByRole('columnheader').count();
  }
}

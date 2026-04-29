import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Teilnahmeverwaltung
 * Route: /planung/teilnahmen
 * Verwendete UCs: UC-005
 */
export class TeilnahmenPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;
  readonly btnAusAnmeldungenErstellen: Locator;
  readonly leerhinweis: Locator;

  readonly inputAnzahlPersonenEffektiv: Locator;
  readonly btnBeitragHinzufuegen: Locator;
  readonly btnSpeichern: Locator;
  readonly btnAbbrechen: Locator;

  readonly erfolgsMeldung: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Teilnahmen', level: 1 });
    this.tabelle = page.getByRole('table');
    this.btnAusAnmeldungenErstellen = page.getByRole('button', {
      name: /Aus Anmeldungen erstellen/,
    });
    this.leerhinweis = page.locator('.leerhinweis');

    this.inputAnzahlPersonenEffektiv = page.getByLabel('Effektive Anzahl Personen');
    this.btnBeitragHinzufuegen = page.getByRole('button', { name: '+ Beitrag hinzufügen' });
    this.btnSpeichern = page.getByRole('button', { name: 'Speichern' });
    this.btnAbbrechen = page.getByRole('button', { name: 'Abbrechen' });

    this.erfolgsMeldung = page.locator('.alert.alert--success');
  }

  async goto(eventId: number) {
    await this.page.goto('/planung/teilnahmen');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async teilnahmenErstellen() {
    await this.btnAusAnmeldungenErstellen.click();
  }

  async bearbeiten(parteiBezeichnung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await zeile.getByRole('button', { name: 'Bearbeiten' }).click();
    await expect(this.inputAnzahlPersonenEffektiv).toBeVisible();
  }

  async anzahlPersonenSetzen(anzahl: number) {
    await this.inputAnzahlPersonenEffektiv.fill(String(anzahl));
  }

  async buffetBeitragHinzufuegen(art: string, beschreibung?: string) {
    await this.btnBeitragHinzufuegen.click();
    const beitraege = this.page.locator('.buffet-beitrag-zeile');
    const letzterBeitrag = beitraege.last();
    await letzterBeitrag.locator('select').selectOption(art);
    if (beschreibung) {
      await letzterBeitrag.locator('input[type="text"]').fill(beschreibung);
    }
  }

  async speichern() {
    await this.btnSpeichern.click();
  }

  async tabellenZeilenAnzahl(): Promise<number> {
    const rows = this.tabelle.getByRole('row');
    return (await rows.count()) - 1;
  }

  async effektiveAnzahlInTabelle(partei: string, anzahl: number) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: partei });
    await expect(zeile).toContainText(String(anzahl));
  }
}

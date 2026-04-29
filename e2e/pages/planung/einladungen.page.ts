import { type Page, type Locator, expect } from '@playwright/test';
import { eventAuswaehlen } from '../../helpers/event-kontext.helper';

/**
 * Page Object für Einladungsverwaltung
 * Route: /planung/einladungen
 * Verwendete UCs: UC-004
 */
export class EinladungenPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly tabelle: Locator;
  readonly btnFuerAlleErstellen: Locator;
  readonly leerhinweis: Locator;

  readonly selectPartei: Locator;
  readonly selectStatus: Locator;
  readonly inputAnzahlPersonen: Locator;
  readonly selectBuffetBeitrag: Locator;
  readonly btnRueckmeldungSpeichern: Locator;
  readonly btnHinzufuegen: Locator;
  readonly btnAbbrechen: Locator;

  readonly erfolgsMeldung: Locator;
  readonly fehlerMeldung: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Einladungen', level: 1 });
    this.tabelle = page.getByRole('table');
    this.btnFuerAlleErstellen = page.getByRole('button', { name: /Für alle Parteien erstellen/ });
    this.leerhinweis = page.locator('.leerhinweis');

    this.selectPartei = page.getByLabel('Partei *');
    this.selectStatus = page.getByLabel('Status *');
    this.inputAnzahlPersonen = page.getByLabel('Anzahl Personen');
    this.selectBuffetBeitrag = page.getByLabel('Buffet-Beitrag');
    this.btnRueckmeldungSpeichern = page.getByRole('button', { name: 'Rückmeldung speichern' });
    this.btnHinzufuegen = page.getByRole('button', { name: 'Hinzufügen' });
    this.btnAbbrechen = page.getByRole('button', { name: 'Abbrechen' });

    this.erfolgsMeldung = page.locator('.alert.alert--success');
    this.fehlerMeldung = page.locator('.alert.alert--error');
  }

  async goto(eventId: number) {
    await this.page.goto('/planung/einladungen');
    await eventAuswaehlen(this.page, eventId);
    await expect(this.heading).toBeVisible();
  }

  async einladungenFuerAlleErstellen() {
    await this.btnFuerAlleErstellen.click();
  }

  async bearbeiten(parteiBezeichnung: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: parteiBezeichnung });
    await zeile.getByRole('button', { name: 'Bearbeiten' }).click();
  }

  async statusSetzen(status: 'OFFEN' | 'ANGEMELDET' | 'ABGEMELDET') {
    const label = { OFFEN: 'Offen', ANGEMELDET: 'Angemeldet', ABGEMELDET: 'Abgemeldet' }[status];
    await this.selectStatus.selectOption(label);
  }

  async speichern() {
    await this.btnRueckmeldungSpeichern.click();
  }

  async einladungInTabelleErwarten(partei: string, status: string) {
    const zeile = this.tabelle.getByRole('row').filter({ hasText: partei });
    await expect(zeile).toBeVisible();
    await expect(zeile).toContainText(status);
  }

  async tabellenZeilenAnzahl(): Promise<number> {
    const rows = this.tabelle.getByRole('row');
    return (await rows.count()) - 1; // Minus Header-Zeile
  }
}

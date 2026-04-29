/**
 * @uc UC-012
 * @name Abrechnung zustellen
 * @route /nachbearbeitung/abrechnungen
 * @spec ../quartierfest-backend/specs/UC-012_Abrechnung-Zustellen.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Abrechnung als zugestellt markieren — Zustellungsdatum wird gesetzt
 *  - [HAPPY]  Zustellungskanal vor Versand ändern
 */
import { test, expect } from '@playwright/test';
import { AbrechnungenPage } from '../pages/nachbearbeitung/abrechnungen.page';
import {
  createTestEvent,
  createTestPartei,
  createTestEinladung,
  createTestTeilnahme,
  createTestAbrechnung,
  deleteTestEvent,
  deleteTestPartei,
  deleteTestEinladung,
  deleteTestTeilnahme,
  deleteTestAbrechnung,
} from '../helpers/api-helpers';

test.describe('UC-012 — Abrechnung zustellen', () => {
  let abrechnungenPage: AbrechnungenPage;

  test.describe('Happy Path', () => {
    test('Abrechnung als zugestellt markieren — Zustellungsdatum wird gesetzt', async ({ page }) => {
      abrechnungenPage = new AbrechnungenPage(page);

      const event = await createTestEvent({ standort: 'Zugestellt-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Zust-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET', anzahlPersonen: 2 });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 2 });
      const abrechnung = await createTestAbrechnung({
        teilnahmeId: teilnahme.id,
        anteilAllgemeinkosten: 30,
        totalKonsumation: 14,
        totalBetrag: 44,
        zustellungskanal: 'EMAIL',
      });

      await abrechnungenPage.goto(event.id);
      await abrechnungenPage.alsZugestelltMarkieren('Partei-Zust-E2E');

      await abrechnungenPage.zustellungsDatumErwarten('Partei-Zust-E2E');

      await deleteTestAbrechnung(abrechnung.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Zustellungskanal vor Versand ändern — von EMAIL auf PAPIER', async ({ page }) => {
      abrechnungenPage = new AbrechnungenPage(page);

      const event = await createTestEvent({ standort: 'Kanal-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Kanal-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET', anzahlPersonen: 2 });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 2 });
      const abrechnung = await createTestAbrechnung({
        teilnahmeId: teilnahme.id,
        anteilAllgemeinkosten: 30,
        totalKonsumation: 14,
        totalBetrag: 44,
        zustellungskanal: 'EMAIL',
      });

      await abrechnungenPage.goto(event.id);
      await abrechnungenPage.kanalAendern('Partei-Kanal-E2E', 'PAPIER');

      const zeile = abrechnungenPage.tabelle.getByRole('row').filter({ hasText: 'Partei-Kanal-E2E' });
      await expect(zeile.locator('select.kanal-select')).toHaveValue('PAPIER');

      await deleteTestAbrechnung(abrechnung.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });
});

/**
 * @uc UC-013
 * @name Inkasso sicherstellen
 * @route /nachbearbeitung/inkasso
 * @spec ../quartierfest-backend/specs/UC-013_Inkasso-Sicherstellen.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Twint-Zahlung erfolgreich erfassen — offener Betrag sinkt auf 0
 *  - [HAPPY]  Teilzahlung reduziert offenen Betrag korrekt
 *  - [HAPPY]  Mahnung erfassen
 *  - [ERROR]  Zahlung ohne Datum speichern schlägt fehl
 */
import { test, expect } from '@playwright/test';
import { InkassoPage } from '../pages/nachbearbeitung/inkasso.page';
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
  heute,
} from '../helpers/api-helpers';

test.describe('UC-013 — Inkasso sicherstellen', () => {
  let inkassoPage: InkassoPage;

  test.describe('Happy Path', () => {
    test('Twint-Zahlung erfolgreich erfassen — offener Betrag wird 0', async ({ page }) => {
      inkassoPage = new InkassoPage(page);

      const event = await createTestEvent({ standort: 'Inkasso-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Inkasso-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 2 });
      const abrechnung = await createTestAbrechnung({
        teilnahmeId: teilnahme.id,
        anteilAllgemeinkosten: 30,
        totalKonsumation: 27,
        totalBetrag: 57,
        zustellungskanal: 'TWINT',
      });

      await inkassoPage.goto(event.id);

      await inkassoPage.zahlungErfassen({
        parteiBezeichnung: 'Partei-Inkasso-E2E',
        kanal: 'TWINT',
        datum: heute(),
        betrag: 57,
      });

      await inkassoPage.zahlungsstatusErwarten('Partei-Inkasso-E2E', 'Bezahlt');
      await inkassoPage.offenenBetragErwarten('Partei-Inkasso-E2E', '0');

      await deleteTestAbrechnung(abrechnung.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Teilzahlung reduziert offenen Betrag korrekt', async ({ page }) => {
      inkassoPage = new InkassoPage(page);

      const event = await createTestEvent({ standort: 'Teilzahlung-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Teilz-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 2 });
      const abrechnung = await createTestAbrechnung({
        teilnahmeId: teilnahme.id,
        anteilAllgemeinkosten: 30,
        totalKonsumation: 50,
        totalBetrag: 80,
        zustellungskanal: 'EMAIL',
      });

      await inkassoPage.goto(event.id);

      await inkassoPage.zahlungErfassen({
        parteiBezeichnung: 'Partei-Teilz-E2E',
        datum: heute(),
        betrag: 50,
      });

      await inkassoPage.zahlungsstatusErwarten('Partei-Teilz-E2E', 'Teilzahlung');
      await inkassoPage.offenenBetragErwarten('Partei-Teilz-E2E', '30');

      await deleteTestAbrechnung(abrechnung.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Mahnung erfassen — wird bei Abrechnung gespeichert', async ({ page }) => {
      inkassoPage = new InkassoPage(page);

      const event = await createTestEvent({ standort: 'Mahnung-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Mahnung-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 2 });
      const abrechnung = await createTestAbrechnung({
        teilnahmeId: teilnahme.id,
        anteilAllgemeinkosten: 30,
        totalKonsumation: 14,
        totalBetrag: 44,
        zustellungskanal: 'EMAIL',
      });

      await inkassoPage.goto(event.id);

      await inkassoPage.mahnungErfassen({
        parteiBezeichnung: 'Partei-Mahnung-E2E',
        datum: heute(),
        bemerkung: 'Bitte zahlen!',
      });

      const zeile = inkassoPage.tabelle.locator('.haupt-zeile').filter({ hasText: 'Partei-Mahnung-E2E' });
      await expect(zeile).toContainText('Mahnung');

      await deleteTestAbrechnung(abrechnung.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Zahlung ohne Datum speichern schlägt fehl', async ({ page }) => {
      inkassoPage = new InkassoPage(page);

      const event = await createTestEvent({ standort: 'Fehler-Inkasso-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-FehlerInk-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 2 });
      const abrechnung = await createTestAbrechnung({
        teilnahmeId: teilnahme.id,
        anteilAllgemeinkosten: 30,
        totalKonsumation: 14,
        totalBetrag: 44,
        zustellungskanal: 'EMAIL',
      });

      await inkassoPage.goto(event.id);
      await inkassoPage.zahlungFormOeffnen('Partei-FehlerInk-E2E');

      const detail = inkassoPage.page.locator('.detail-panel');
      await detail.getByLabel('Betrag (CHF) *').fill('44');
      // Datum leeren (Formular wird mit heutigem Datum initialisiert)
      await detail.getByLabel('Datum *').fill('');
      await detail.getByRole('button', { name: 'Speichern' }).click();

      await expect(detail.locator('.feldFehler').filter({ hasText: 'Datum ist erforderlich' })).toBeVisible();

      await deleteTestAbrechnung(abrechnung.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });
});

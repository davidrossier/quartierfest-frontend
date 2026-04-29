/**
 * @uc UC-010
 * @name Konsumation übernehmen
 * @route /durchfuehrung/konsumationen
 * @spec ../quartierfest-backend/specs/UC-010_Konsumation-Uebernehmen.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Konsumation einer Partei erfolgreich erfassen
 *  - [HAPPY]  Konsumationstotal wird korrekt berechnet und angezeigt
 *  - [ERROR]  Negative Anzahl wird abgelehnt
 */
import { test, expect } from '@playwright/test';
import { KonsumationenPage } from '../pages/durchfuehrung/konsumationen.page';
import {
  createTestEvent,
  createTestPartei,
  createTestEinladung,
  createTestTeilnahme,
  createTestKonsumationsangebot,
  deleteTestEvent,
  deleteTestPartei,
  deleteTestEinladung,
  deleteTestTeilnahme,
  deleteTestKonsumationsangebot,
} from '../helpers/api-helpers';

test.describe('UC-010 — Konsumation übernehmen', () => {
  let konsumationenPage: KonsumationenPage;

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Konsumation einer Partei erfolgreich erfassen', async ({ page }) => {
      konsumationenPage = new KonsumationenPage(page);

      const event = await createTestEvent({ standort: 'Konsumation-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Kons-E2E', adresse: 'Gasse 1' });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Bier-Kons-E2E', preis: 3.5 });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id });

      await konsumationenPage.goto(event.id);
      await konsumationenPage.anzahlEingeben('Partei-Kons-E2E', 0, 4);
      await konsumationenPage.speichern();

      await expect(konsumationenPage.erfolgsMeldung).toBeVisible();

      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Konsumationstotal wird korrekt berechnet — 4 × Bier à 3.50 = 14.00', async ({ page }) => {
      konsumationenPage = new KonsumationenPage(page);

      const event = await createTestEvent({ standort: 'KonsTotal-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Total-E2E', adresse: 'Gasse 1' });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Bier-Total-E2E', preis: 3.5 });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id });

      await konsumationenPage.goto(event.id);
      await konsumationenPage.anzahlEingeben('Partei-Total-E2E', 0, 4);

      await konsumationenPage.totalFuerParteiErwarten('Partei-Total-E2E', '14');

      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Negative Anzahl wird abgelehnt — Speichern blockiert', async ({ page }) => {
      konsumationenPage = new KonsumationenPage(page);

      const event = await createTestEvent({ standort: 'KonsNegativ-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Negativ-E2E', adresse: 'Gasse 1' });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Bier-Negativ-E2E', preis: 3.5 });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id });

      await konsumationenPage.goto(event.id);
      await konsumationenPage.anzahlEingeben('Partei-Negativ-E2E', 0, -1);

      const fehlerInput = konsumationenPage.tabelle.locator('.anzahl-input--fehler');
      await expect(fehlerInput).toBeVisible();

      await konsumationenPage.speichern();
      await expect(konsumationenPage.fehlerMeldung).toContainText('Negative Anzahlen sind nicht erlaubt.');

      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });
});

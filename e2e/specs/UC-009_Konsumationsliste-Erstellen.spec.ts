/**
 * @uc UC-009
 * @name Konsumationsliste erstellen
 * @route /durchfuehrung/konsumationsliste
 * @spec ../quartierfest-backend/specs/UC-009_Konsumationsliste-Erstellen.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Konsumationsliste erfolgreich generieren — Matrix wird angezeigt
 *  - [ERROR]  Konsumationsliste ohne Angebot zeigt Warnhinweis
 *  - [ERROR]  Konsumationsliste ohne Teilnahmen zeigt Warnhinweis
 *
 * Nicht abgedeckt:
 *  - Drucken (window.print()) — nicht testbar in Playwright ohne Mock
 */
import { test, expect } from '@playwright/test';
import { KonsumationslistePage } from '../pages/durchfuehrung/konsumationsliste.page';
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

test.describe('UC-009 — Konsumationsliste erstellen', () => {
  let listePage: KonsumationslistePage;

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Konsumationsliste erfolgreich generieren — Partei und Angebote werden angezeigt', async ({
      page,
    }) => {
      listePage = new KonsumationslistePage(page);

      const event = await createTestEvent({ standort: 'Liste-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Liste-E2E', adresse: 'Gasse 1' });
      const angebot1 = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Bier-Liste-E2E', preis: 3.5 });
      const angebot2 = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Wasser-Liste-E2E', preis: 1.5 });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id });

      await listePage.goto(event.id);

      await expect(listePage.tabelle).toBeVisible();
      await expect(listePage.tabelle.getByRole('row').filter({ hasText: 'Partei-Liste-E2E' })).toBeVisible();
      await expect(listePage.tabelle).toContainText('Bier-Liste-E2E');
      await expect(listePage.tabelle).toContainText('Wasser-Liste-E2E');

      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestKonsumationsangebot(angebot1.id);
      await deleteTestKonsumationsangebot(angebot2.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Konsumationsliste ohne Angebot zeigt Warnhinweis', async ({ page }) => {
      listePage = new KonsumationslistePage(page);

      const event = await createTestEvent({ standort: 'Liste-KeinAngebot-E2E' });

      await listePage.goto(event.id);

      await expect(listePage.warnungKeinAngebot).toBeVisible();
      await expect(listePage.tabelle).toHaveCount(0);

      await deleteTestEvent(event.id);
    });

    test('Konsumationsliste ohne Teilnahmen zeigt Warnhinweis', async ({ page }) => {
      listePage = new KonsumationslistePage(page);

      const event = await createTestEvent({ standort: 'Liste-KeineTeilnahmen-E2E' });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Bier-E2E', preis: 3.5 });

      await listePage.goto(event.id);

      await expect(listePage.warnungKeineTeilnahmen).toBeVisible();

      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestEvent(event.id);
    });
  });
});

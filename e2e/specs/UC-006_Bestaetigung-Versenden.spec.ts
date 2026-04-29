/**
 * @uc UC-006
 * @name Bestätigung erstellen und versenden
 * @route /planung/bestaetigung
 * @spec ../quartierfest-backend/specs/UC-006_Bestaetigung-Versenden.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Bestätigung erfolgreich als versendet markieren (einzeln)
 *  - [HAPPY]  Alle Bestätigungen als versendet markieren
 *  - [ERROR]  Bestätigung ohne Konsumationsangebot zeigt Warnung
 */
import { test, expect } from '@playwright/test';
import { BestaetigungPage } from '../pages/planung/bestaetigung.page';
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

test.describe('UC-006 — Bestätigung erstellen und versenden', () => {
  let bestaetigungPage: BestaetigungPage;

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Bestätigung erfolgreich als versendet markieren — einzeln', async ({ page }) => {
      bestaetigungPage = new BestaetigungPage(page);

      const event = await createTestEvent({ standort: 'Bestaetigung-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Best-E2E', adresse: 'Gasse 1' });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Bier-E2E', preis: 3.5 });
      const einladung = await createTestEinladung({
        eventId: event.id,
        parteiId: partei.id,
        status: 'ANGEMELDET',
        anzahlPersonen: 2,
      });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id });

      await bestaetigungPage.goto(event.id);
      await bestaetigungPage.bestaetigungStatusErwarten('Partei-Best-E2E', 'Ausstehend');
      await bestaetigungPage.einzelnAlsVersendetMarkieren('Partei-Best-E2E');
      await bestaetigungPage.bestaetigungStatusErwarten('Partei-Best-E2E', 'Versendet');

      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Alle Bestätigungen als versendet markieren', async ({ page }) => {
      bestaetigungPage = new BestaetigungPage(page);

      const event = await createTestEvent({ standort: 'BestAlleMarkieren-E2E' });
      const partei1 = await createTestPartei({ bezeichnung: 'Partei-AlleA-E2E', adresse: 'Gasse 1' });
      const partei2 = await createTestPartei({ bezeichnung: 'Partei-AlleB-E2E', adresse: 'Gasse 2' });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Wasser-E2E', preis: 1.5 });
      const einladung1 = await createTestEinladung({ eventId: event.id, parteiId: partei1.id, status: 'ANGEMELDET' });
      const einladung2 = await createTestEinladung({ eventId: event.id, parteiId: partei2.id, status: 'ANGEMELDET' });
      const teilnahme1 = await createTestTeilnahme({ einladungId: einladung1.id });
      const teilnahme2 = await createTestTeilnahme({ einladungId: einladung2.id });

      await bestaetigungPage.goto(event.id);
      await expect(bestaetigungPage.btnAlleMarkieren).toBeVisible();
      await bestaetigungPage.alleAlsVersendetMarkieren();

      await bestaetigungPage.bestaetigungStatusErwarten('Partei-AlleA-E2E', 'Versendet');
      await bestaetigungPage.bestaetigungStatusErwarten('Partei-AlleB-E2E', 'Versendet');

      await deleteTestTeilnahme(teilnahme1.id);
      await deleteTestTeilnahme(teilnahme2.id);
      await deleteTestEinladung(einladung1.id);
      await deleteTestEinladung(einladung2.id);
      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestPartei(partei1.id);
      await deleteTestPartei(partei2.id);
      await deleteTestEvent(event.id);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Bestätigung ohne Konsumationsangebot zeigt Warnhinweis', async ({ page }) => {
      bestaetigungPage = new BestaetigungPage(page);

      const event = await createTestEvent({ standort: 'BestKeinAngebot-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-KeinAngebot-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });

      await bestaetigungPage.goto(event.id);

      await expect(bestaetigungPage.warnungKeinAngebot).toBeVisible();

      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });
});

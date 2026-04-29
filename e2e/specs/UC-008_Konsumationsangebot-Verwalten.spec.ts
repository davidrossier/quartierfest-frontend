/**
 * @uc UC-008
 * @name Konsumationsangebot verwalten
 * @route /planung/konsumationsangebote
 * @spec ../quartierfest-backend/specs/UC-008_Konsumationsangebot-Verwalten.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Angebotseintrag erfolgreich erfassen
 *  - [HAPPY]  Angebotseintrag löschen
 *  - [ERROR]  Angebotseintrag ohne Preis speichern schlägt fehl
 *  - [ERROR]  Angebotseintrag ohne Bezeichnung speichern schlägt fehl
 *  - [ERROR]  Angebotseintrag mit bestehenden Konsumationen löschen schlägt fehl
 *
 * Nicht abgedeckt:
 *  - FK-Constraint beim Löschen mit Konsumationen — erfordert vollständiges Konsumations-Setup
 */
import { test, expect } from '@playwright/test';
import { KonsumationsangebotePage } from '../pages/planung/konsumationsangebote.page';
import {
  createTestEvent,
  createTestPartei,
  createTestEinladung,
  createTestTeilnahme,
  createTestKonsumationsangebot,
  createTestKonsumation,
  deleteTestEvent,
  deleteTestPartei,
  deleteTestEinladung,
  deleteTestTeilnahme,
  deleteTestKonsumationsangebot,
  deleteTestKonsumation,
  type TestKonsumationsangebot,
} from '../helpers/api-helpers';

test.describe('UC-008 — Konsumationsangebot verwalten', () => {
  let angebotePage: KonsumationsangebotePage;

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Angebotseintrag erfolgreich erfassen', async ({ page }) => {
      angebotePage = new KonsumationsangebotePage(page);

      const event = await createTestEvent({ standort: 'Angebot-Test-E2E' });

      await angebotePage.goto(event.id);
      await angebotePage.formularAusfuellen({ bezeichnung: 'Bier-E2E', preis: 3.5 });
      await angebotePage.speichern();

      await angebotePage.angebotInTabelleErwarten('Bier-E2E');

      const angebote = await fetch('http://localhost:8080/api/konsumationsangebote').then((r) => r.json());
      const a = angebote.find((x: TestKonsumationsangebot) => x.bezeichnung === 'Bier-E2E');
      if (a) await deleteTestKonsumationsangebot(a.id);
      await deleteTestEvent(event.id);
    });

    test('Angebotseintrag löschen', async ({ page }) => {
      angebotePage = new KonsumationsangebotePage(page);

      const event = await createTestEvent({ standort: 'Delete-Angebot-E2E' });
      const angebot = await createTestKonsumationsangebot({
        eventId: event.id,
        bezeichnung: 'Delete-Bier-E2E',
        preis: 3.5,
      });

      await angebotePage.goto(event.id);
      await angebotePage.loeschen('Delete-Bier-E2E');

      await expect(
        angebotePage.tabelle.getByRole('row').filter({ hasText: 'Delete-Bier-E2E' }),
      ).toHaveCount(0);

      await deleteTestEvent(event.id);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Angebotseintrag ohne Preis speichern schlägt fehl', async ({ page }) => {
      angebotePage = new KonsumationsangebotePage(page);

      const event = await createTestEvent({ standort: 'Fehler-Angebot-E2E' });

      await angebotePage.goto(event.id);
      await angebotePage.inputBezeichnung.fill('Wasser-E2E');
      await angebotePage.speichern();

      await expect(angebotePage.feldFehler.filter({ hasText: 'Preis ist erforderlich' })).toBeVisible();

      await deleteTestEvent(event.id);
    });

    test('Angebotseintrag ohne Bezeichnung speichern schlägt fehl', async ({ page }) => {
      angebotePage = new KonsumationsangebotePage(page);

      const event = await createTestEvent({ standort: 'Fehler2-Angebot-E2E' });

      await angebotePage.goto(event.id);
      await angebotePage.inputPreis.fill('2.5');
      await angebotePage.speichern();

      await expect(
        angebotePage.feldFehler.filter({ hasText: 'Bezeichnung ist erforderlich' }),
      ).toBeVisible();

      await deleteTestEvent(event.id);
    });

    test('Angebotseintrag mit bestehenden Konsumationen löschen schlägt fehl', async ({ page }) => {
      angebotePage = new KonsumationsangebotePage(page);

      const event = await createTestEvent({ standort: 'FK-Angebot-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-FK-Ang-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET' });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'FK-Bier-E2E', preis: 3.5 });
      const konsumation = await createTestKonsumation({ teilnahmeId: teilnahme.id, konsumationsangebotId: angebot.id, anzahl: 2 });

      await angebotePage.goto(event.id);
      await angebotePage.loeschen('FK-Bier-E2E');

      await expect(angebotePage.fehlerMeldung).toBeVisible();

      await deleteTestKonsumation(konsumation.id);
      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });
});

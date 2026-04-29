/**
 * @uc UC-003
 * @name Event anlegen
 * @route /events
 * @spec ../quartierfest-backend/specs/UC-003_Event-Anlegen.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Event erfolgreich anlegen
 *  - [HAPPY]  Event nachträglich bearbeiten — alternativen Standort ergänzen
 *  - [HAPPY]  Event löschen
 *  - [ERROR]  Event ohne Pflichtfeld speichern schlägt fehl
 */
import { test, expect } from '@playwright/test';
import { EventsPage } from '../pages/events.page';
import { createTestEvent, deleteTestEvent, type TestEvent } from '../helpers/api-helpers';

test.describe('UC-003 — Event anlegen', () => {
  let eventsPage: EventsPage;

  test.beforeEach(async ({ page }) => {
    eventsPage = new EventsPage(page);
    await eventsPage.goto();
  });

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Event erfolgreich anlegen', async () => {
      await eventsPage.formularAusfuellen({
        datum: '2025-07-05',
        startzeit: '17:00',
        standort: 'Buchlenwiese-E2E',
      });
      await eventsPage.speichern();

      await eventsPage.eventInTabelleErwarten('Buchlenwiese-E2E');

      const events = await fetch('http://localhost:8080/api/events').then((r) => r.json());
      const e = events.find((x: TestEvent) => x.standort === 'Buchlenwiese-E2E');
      if (e) await deleteTestEvent(e.id);
    });

    test('Event nachträglich bearbeiten — alternativen Standort ergänzen', async () => {
      const event = await createTestEvent({ standort: 'Hauptwiese-E2E' });

      await eventsPage.goto();
      await eventsPage.bearbeiten('Hauptwiese-E2E');
      await eventsPage.inputAlternativerStandort.fill('Turnhalle-E2E');
      await eventsPage.speichern();

      const zeile = eventsPage.tabelle.getByRole('row').filter({ hasText: 'Hauptwiese-E2E' });
      await expect(zeile).toContainText('Turnhalle-E2E');

      await deleteTestEvent(event.id);
    });

    test('Event löschen', async () => {
      const event = await createTestEvent({ standort: 'Delete-Event-E2E' });

      await eventsPage.goto();
      await eventsPage.loeschen('Delete-Event-E2E');

      await expect(
        eventsPage.tabelle.getByRole('row').filter({ hasText: 'Delete-Event-E2E' }),
      ).toHaveCount(0);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Event ohne Datum speichern schlägt fehl', async () => {
      await eventsPage.inputStartzeit.fill('17:00');
      await eventsPage.inputStandort.fill('Kein-Datum-E2E');
      await eventsPage.speichern();

      await expect(eventsPage.feldFehler.filter({ hasText: 'Datum ist erforderlich' })).toBeVisible();
    });

    test('Event ohne Standort speichern schlägt fehl', async () => {
      await eventsPage.inputDatum.fill('2025-07-05');
      await eventsPage.inputStartzeit.fill('17:00');
      await eventsPage.speichern();

      await expect(
        eventsPage.feldFehler.filter({ hasText: 'Standort ist erforderlich' }),
      ).toBeVisible();
    });
  });
});

/**
 * @uc UC-007
 * @name Allgemeinausgaben verwalten
 * @route /planung/allgemeinausgaben
 * @spec ../quartierfest-backend/specs/UC-007_Allgemeinausgabe-Verwalten.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Allgemeinausgabe erfolgreich erfassen
 *  - [HAPPY]  Gesamtbetrag wird korrekt summiert
 *  - [HAPPY]  Ausgabe löschen
 *  - [ERROR]  Ausgabe ohne Betrag speichern schlägt fehl
 *  - [ERROR]  Ausgabe ohne Beschreibung speichern schlägt fehl
 */
import { test, expect } from '@playwright/test';
import { AllgemeinausgabenPage } from '../pages/planung/allgemeinausgaben.page';
import {
  createTestEvent,
  createTestAllgemeinausgabe,
  deleteTestEvent,
  deleteTestAllgemeinausgabe,
  type TestAllgemeinausgabe,
} from '../helpers/api-helpers';

test.describe('UC-007 — Allgemeinausgaben verwalten', () => {
  let ausgabenPage: AllgemeinausgabenPage;

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Allgemeinausgabe erfolgreich erfassen', async ({ page }) => {
      ausgabenPage = new AllgemeinausgabenPage(page);

      const event = await createTestEvent({ standort: 'Ausgabe-Test-E2E' });

      await ausgabenPage.goto(event.id);
      await ausgabenPage.formularAusfuellen({
        beschreibung: 'Kühlschrankmiete-E2E',
        betrag: 80,
        herkunft: 'Metzgerei Meier',
      });
      await ausgabenPage.speichern();

      await ausgabenPage.ausgabeInTabelleErwarten('Kühlschrankmiete-E2E');

      const ausgaben = await fetch('http://localhost:8080/api/allgemeinausgaben').then((r) => r.json());
      const a = ausgaben.find((x: TestAllgemeinausgabe) => x.beschreibung === 'Kühlschrankmiete-E2E');
      if (a) await deleteTestAllgemeinausgabe(a.id);
      await deleteTestEvent(event.id);
    });

    test('Gesamtbetrag wird korrekt summiert', async ({ page }) => {
      ausgabenPage = new AllgemeinausgabenPage(page);

      const event = await createTestEvent({ standort: 'Gesamt-Test-E2E' });
      const a1 = await createTestAllgemeinausgabe({ eventId: event.id, beschreibung: 'Ausgabe1-E2E', betrag: 80 });
      const a2 = await createTestAllgemeinausgabe({ eventId: event.id, beschreibung: 'Ausgabe2-E2E', betrag: 45 });

      await ausgabenPage.goto(event.id);
      await ausgabenPage.gesamtbetragErwarten('125');

      await deleteTestAllgemeinausgabe(a1.id);
      await deleteTestAllgemeinausgabe(a2.id);
      await deleteTestEvent(event.id);
    });

    test('Ausgabe löschen', async ({ page }) => {
      ausgabenPage = new AllgemeinausgabenPage(page);

      const event = await createTestEvent({ standort: 'Delete-Ausgabe-E2E' });
      const ausgabe = await createTestAllgemeinausgabe({
        eventId: event.id,
        beschreibung: 'Delete-Ausgabe-E2E',
        betrag: 50,
      });

      await ausgabenPage.goto(event.id);
      await ausgabenPage.loeschen('Delete-Ausgabe-E2E');

      await expect(
        ausgabenPage.tabelle.getByRole('row').filter({ hasText: 'Delete-Ausgabe-E2E' }),
      ).toHaveCount(0);

      await deleteTestEvent(event.id);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Ausgabe ohne Betrag speichern schlägt fehl', async ({ page }) => {
      ausgabenPage = new AllgemeinausgabenPage(page);

      const event = await createTestEvent({ standort: 'Fehler-Ausgabe-E2E' });

      await ausgabenPage.goto(event.id);
      await ausgabenPage.inputBeschreibung.fill('Beschreibung ohne Betrag');
      await ausgabenPage.speichern();

      await expect(ausgabenPage.feldFehler.filter({ hasText: 'Betrag ist erforderlich' })).toBeVisible();

      await deleteTestEvent(event.id);
    });

    test('Ausgabe ohne Beschreibung speichern schlägt fehl', async ({ page }) => {
      ausgabenPage = new AllgemeinausgabenPage(page);

      const event = await createTestEvent({ standort: 'Fehler2-Ausgabe-E2E' });

      await ausgabenPage.goto(event.id);
      await ausgabenPage.inputBetrag.fill('50');
      await ausgabenPage.speichern();

      await expect(
        ausgabenPage.feldFehler.filter({ hasText: 'Beschreibung ist erforderlich' }),
      ).toBeVisible();

      await deleteTestEvent(event.id);
    });
  });
});

/**
 * @uc UC-002
 * @name Parteien verwalten
 * @route /parteien
 * @spec ../quartierfest-backend/specs/UC-002_Partei-Verwalten.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Partei mit Bezeichnung und Twint erfolgreich erfassen
 *  - [HAPPY]  Personen einer Partei über Tabelle zuordnen
 *  - [HAPPY]  Partei bearbeiten
 *  - [ERROR]  Pflichtfeld Bezeichnung fehlt
 *  - [ERROR]  Pflichtfeld Adresse fehlt
 *  - [ERROR]  Partei mit bestehender Einladung löschen schlägt fehl
 */
import { test, expect } from '@playwright/test';
import { ParteienPage } from '../pages/parteien.page';
import {
  createTestPerson,
  createTestPartei,
  createTestEvent,
  createTestEinladung,
  deleteTestPartei,
  deleteTestPerson,
  deleteTestEvent,
  deleteTestEinladung,
  type TestPartei,
} from '../helpers/api-helpers';

test.describe('UC-002 — Parteien verwalten', () => {
  let parteienPage: ParteienPage;

  test.beforeEach(async ({ page }) => {
    parteienPage = new ParteienPage(page);
    await parteienPage.goto();
  });

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Partei mit Bezeichnung und Twint erfolgreich erfassen', async () => {
      await parteienPage.formularAusfuellen({
        bezeichnung: 'Familie E2E-Test',
        adresse: 'Seestrasse 1, 3000 Bern',
        twintAktiv: true,
        twintMobilenummer: '+41791234567',
      });
      await parteienPage.speichern();

      await parteienPage.parteiInTabelleErwarten('Familie E2E-Test');
      const zeile = parteienPage.tabelle.getByRole('row').filter({ hasText: 'Familie E2E-Test' });
      await expect(zeile).toContainText('Aktiv');

      const parteien = await fetch('http://localhost:8080/api/parteien').then((r) => r.json());
      const p = parteien.find((x: TestPartei) => x.bezeichnung === 'Familie E2E-Test');
      if (p) await deleteTestPartei(p.id);
    });

    test('Personen einer Partei über Tabelle zuordnen', async () => {
      const person1 = await createTestPerson({ vorname: 'Anna', name: 'Zuordnung-E2E' });
      const person2 = await createTestPerson({ vorname: 'Beat', name: 'Zuordnung-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Zuordnung-E2E', adresse: 'Testgasse 1' });

      await parteienPage.goto();
      await parteienPage.bearbeiten('Partei-Zuordnung-E2E');
      await parteienPage.personAuswaehlen('Anna Zuordnung-E2E');
      await parteienPage.personAuswaehlen('Beat Zuordnung-E2E');
      await parteienPage.speichern();

      const zeile = parteienPage.tabelle.getByRole('row').filter({ hasText: 'Partei-Zuordnung-E2E' });
      await expect(zeile).toContainText('Anna');
      await expect(zeile).toContainText('Beat');

      await deleteTestPartei(partei.id);
      await deleteTestPerson(person1.id);
      await deleteTestPerson(person2.id);
    });

    test('Partei bearbeiten — Adresse aktualisieren', async () => {
      const partei = await createTestPartei({ bezeichnung: 'Partei-Edit-E2E', adresse: 'Alte Strasse 1' });

      await parteienPage.goto();
      await parteienPage.bearbeiten('Partei-Edit-E2E');
      await parteienPage.inputAdresse.fill('Neue Strasse 99, 3000 Bern');
      await parteienPage.speichern();

      const zeile = parteienPage.tabelle.getByRole('row').filter({ hasText: 'Partei-Edit-E2E' });
      await expect(zeile).toContainText('Neue Strasse 99');

      await deleteTestPartei(partei.id);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Pflichtfeld Bezeichnung fehlt — Formular zeigt Validierungsfehler', async () => {
      await parteienPage.inputAdresse.fill('Irgendwo 1');
      await parteienPage.speichern();

      await expect(
        parteienPage.feldFehler.filter({ hasText: 'Bezeichnung ist erforderlich' }),
      ).toBeVisible();
    });

    test('Pflichtfeld Adresse fehlt — Formular zeigt Validierungsfehler', async () => {
      await parteienPage.inputBezeichnung.fill('NurBezeichnung');
      await parteienPage.speichern();

      await expect(
        parteienPage.feldFehler.filter({ hasText: 'Adresse ist erforderlich' }),
      ).toBeVisible();
    });

    test('Partei mit bestehender Einladung löschen schlägt fehl', async () => {
      const event = await createTestEvent({ standort: 'FK-Test-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-FK-E2E', adresse: 'Testgasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id });

      await parteienPage.goto();
      await parteienPage.loeschen('Partei-FK-E2E');

      await expect(parteienPage.fehlerMeldung).toBeVisible();

      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });
});

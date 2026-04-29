/**
 * @uc UC-005
 * @name Teilnahmen verwalten
 * @route /planung/teilnahmen
 * @spec ../quartierfest-backend/specs/UC-005_Teilnahme-Verwalten.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Konsolidierte Teilnahmeübersicht anzeigen
 *  - [HAPPY]  Teilnahmen aus Anmeldungen erstellen
 *  - [HAPPY]  Effektive Personenzahl nachträglich anpassen
 *  - [HAPPY]  Mehrere Buffet-Beiträge erfassen
 *  - [ERROR]  Teilnahmeübersicht ohne Anmeldungen zeigt leere Liste
 */
import { test, expect } from '@playwright/test';
import { TeilnahmenPage } from '../pages/planung/teilnahmen.page';
import {
  createTestEvent,
  createTestPartei,
  createTestEinladung,
  createTestTeilnahme,
  deleteTestEvent,
  deleteTestPartei,
  deleteTestEinladung,
  deleteTestTeilnahme,
} from '../helpers/api-helpers';

test.describe('UC-005 — Teilnahmen verwalten', () => {
  let teilnahmenPage: TeilnahmenPage;

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Konsolidierte Teilnahmeübersicht — Teilnahmen werden angezeigt', async ({ page }) => {
      teilnahmenPage = new TeilnahmenPage(page);

      const event = await createTestEvent({ standort: 'Teilnahme-Uebersicht-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Teilnahme-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({
        eventId: event.id,
        parteiId: partei.id,
        status: 'ANGEMELDET',
        anzahlPersonen: 3,
      });
      const teilnahme = await createTestTeilnahme({
        einladungId: einladung.id,
        anzahlPersonenEffektiv: 3,
      });

      await teilnahmenPage.goto(event.id);

      await expect(
        teilnahmenPage.tabelle.getByRole('row').filter({ hasText: 'Partei-Teilnahme-E2E' }),
      ).toBeVisible();

      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Teilnahmen aus Anmeldungen erstellen', async ({ page }) => {
      teilnahmenPage = new TeilnahmenPage(page);

      const event = await createTestEvent({ standort: 'Teilnahme-Erstellen-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Erstellen-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({
        eventId: event.id,
        parteiId: partei.id,
        status: 'ANGEMELDET',
        anzahlPersonen: 2,
      });

      await teilnahmenPage.goto(event.id);
      await expect(teilnahmenPage.btnAusAnmeldungenErstellen).toBeEnabled();
      await teilnahmenPage.teilnahmenErstellen();

      await expect(
        teilnahmenPage.tabelle.getByRole('row').filter({ hasText: 'Partei-Erstellen-E2E' }),
      ).toBeVisible();

      const teilnahmen = await fetch('http://localhost:8080/api/teilnahmen').then((r) => r.json());
      const t = teilnahmen.find((x: { einladung: { id: number } }) => x.einladung.id === einladung.id);
      if (t) await deleteTestTeilnahme(t.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Effektive Personenzahl nachträglich anpassen', async ({ page }) => {
      teilnahmenPage = new TeilnahmenPage(page);

      const event = await createTestEvent({ standort: 'Personenzahl-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Anzahl-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({
        eventId: event.id,
        parteiId: partei.id,
        status: 'ANGEMELDET',
        anzahlPersonen: 3,
      });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 3 });

      await teilnahmenPage.goto(event.id);
      await teilnahmenPage.bearbeiten('Partei-Anzahl-E2E');
      await teilnahmenPage.anzahlPersonenSetzen(4);
      await teilnahmenPage.speichern();

      await teilnahmenPage.effektiveAnzahlInTabelle('Partei-Anzahl-E2E', '4');

      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Mehrere Buffet-Beiträge erfassen', async ({ page }) => {
      teilnahmenPage = new TeilnahmenPage(page);

      const event = await createTestEvent({ standort: 'Buffet-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Buffet-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({
        eventId: event.id,
        parteiId: partei.id,
        status: 'ANGEMELDET',
      });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id });

      await teilnahmenPage.goto(event.id);
      await teilnahmenPage.bearbeiten('Partei-Buffet-E2E');
      await teilnahmenPage.buffetBeitragHinzufuegen('SALAT', 'Rüebli-Salat');
      await teilnahmenPage.buffetBeitragHinzufuegen('DESSERT', 'Tiramisu');
      await teilnahmenPage.speichern();

      const zeile = teilnahmenPage.tabelle.getByRole('row').filter({ hasText: 'Partei-Buffet-E2E' });
      await expect(zeile).toContainText('Salat');
      await expect(zeile).toContainText('Dessert');

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
    test('Teilnahmeübersicht ohne Anmeldungen zeigt leere Liste mit Hinweis', async ({ page }) => {
      teilnahmenPage = new TeilnahmenPage(page);

      const event = await createTestEvent({ standort: 'Leer-Teilnahme-E2E' });

      await teilnahmenPage.goto(event.id);

      await expect(teilnahmenPage.leerhinweis).toBeVisible();

      await deleteTestEvent(event.id);
    });
  });
});

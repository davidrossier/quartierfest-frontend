/**
 * @uc UC-004
 * @name Einladung erstellen und verwalten
 * @route /planung/einladungen
 * @spec ../quartierfest-backend/specs/UC-004_Einladung-Verwalten.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Einladungen für alle Parteien erstellen
 *  - [HAPPY]  Rückmeldung Anmeldung erfassen (Status, Anzahl Personen, Buffet)
 *  - [HAPPY]  Rückmeldung Abmeldung erfassen
 *  - [EDGE]   Einladungen erstellen überspringt bereits vorhandene Einladung
 */
import { test, expect } from '@playwright/test';
import { EinladungenPage } from '../pages/planung/einladungen.page';
import {
  createTestEvent,
  createTestPartei,
  createTestEinladung,
  deleteTestEvent,
  deleteTestPartei,
  deleteTestEinladung,
  type TestEinladung,
} from '../helpers/api-helpers';

test.describe('UC-004 — Einladung erstellen und verwalten', () => {
  let einladungenPage: EinladungenPage;

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Einladungen für alle Parteien erstellen', async ({ page }) => {
      einladungenPage = new EinladungenPage(page);

      const event = await createTestEvent({ standort: 'Einladung-Test-E2E' });
      const partei1 = await createTestPartei({ bezeichnung: 'Partei-A-E2E', adresse: 'Gasse 1' });
      const partei2 = await createTestPartei({ bezeichnung: 'Partei-B-E2E', adresse: 'Gasse 2' });

      await einladungenPage.goto(event.id);
      await einladungenPage.einladungenFuerAlleErstellen();

      await expect(async () => {
        const count = await einladungenPage.tabellenZeilenAnzahl();
        expect(count).toBeGreaterThanOrEqual(2);
      }).toPass({ timeout: 8000 });

      // Cleanup — Einladungen werden kaskadierend beim Löschen der Entitäten entfernt
      const einladungen = await fetch(
        `http://localhost:8080/api/einladungen?eventId=${event.id}`,
      ).then((r) => r.json());
      for (const e of einladungen) await deleteTestEinladung(e.id);
      await deleteTestPartei(partei1.id);
      await deleteTestPartei(partei2.id);
      await deleteTestEvent(event.id);
    });

    test('Rückmeldung Anmeldung erfassen — Status, Personenzahl und Buffet setzen', async ({
      page,
    }) => {
      einladungenPage = new EinladungenPage(page);

      const event = await createTestEvent({ standort: 'Anmeldung-Test-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Anmeldung-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id });

      await einladungenPage.goto(event.id);
      await einladungenPage.bearbeiten('Partei-Anmeldung-E2E');
      await einladungenPage.statusSetzen('ANGEMELDET');
      await einladungenPage.inputAnzahlPersonen.fill('3');
      await einladungenPage.selectBuffetBeitrag.selectOption('SALAT');
      await einladungenPage.speichern();

      await einladungenPage.einladungInTabelleErwarten('Partei-Anmeldung-E2E', 'Angemeldet');

      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Rückmeldung Abmeldung erfassen', async ({ page }) => {
      einladungenPage = new EinladungenPage(page);

      const event = await createTestEvent({ standort: 'Abmeldung-Test-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Abmeldung-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id });

      await einladungenPage.goto(event.id);
      await einladungenPage.bearbeiten('Partei-Abmeldung-E2E');
      await einladungenPage.statusSetzen('ABGEMELDET');
      await einladungenPage.speichern();

      await einladungenPage.einladungInTabelleErwarten('Partei-Abmeldung-E2E', 'Abgemeldet');

      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });

  // ================================================================
  // Grenzfälle
  // ================================================================
  test.describe('Grenzfälle', () => {
    test('Einladungen erstellen überspringt bereits vorhandene Einladung — keine Duplikate', async ({
      page,
    }) => {
      einladungenPage = new EinladungenPage(page);

      const event = await createTestEvent({ standort: 'Duplikat-Test-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Duplikat-E2E', adresse: 'Gasse 1' });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id });

      await einladungenPage.goto(event.id);
      // Nochmals "Für alle erstellen" — Partei hat bereits Einladung
      await einladungenPage.einladungenFuerAlleErstellen();

      // Nur 1 Einladung vorhanden — keine Duplikate
      const count = await einladungenPage.tabellenZeilenAnzahl();
      expect(count).toBe(1);

      await deleteTestEinladung(einladung.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });
});

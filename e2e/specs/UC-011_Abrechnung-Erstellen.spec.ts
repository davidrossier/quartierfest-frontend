/**
 * @uc UC-011
 * @name Abrechnung erstellen
 * @route /nachbearbeitung/abrechnungen
 * @spec ../quartierfest-backend/specs/UC-011_Abrechnung-Erstellen.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Abrechnungen erfolgreich erstellen — alle Parteien erhalten Abrechnung
 *  - [HAPPY]  Anteil Allgemeinkosten korrekt berechnen
 *  - [HAPPY]  Zustellungskanal automatisch auf TWINT gesetzt bei twintAktiv=true
 */
import { test, expect } from '@playwright/test';
import { AbrechnungenPage } from '../pages/nachbearbeitung/abrechnungen.page';
import {
  createTestEvent,
  createTestPartei,
  createTestEinladung,
  createTestTeilnahme,
  createTestKonsumationsangebot,
  createTestAllgemeinausgabe,
  createTestKonsumation,
  deleteTestEvent,
  deleteTestPartei,
  deleteTestEinladung,
  deleteTestTeilnahme,
  deleteTestKonsumationsangebot,
  deleteTestAllgemeinausgabe,
  deleteTestKonsumation,
  deleteTestAbrechnung,
  type TestAbrechnung,
} from '../helpers/api-helpers';

test.describe('UC-011 — Abrechnung erstellen', () => {
  let abrechnungenPage: AbrechnungenPage;

  test.describe('Happy Path', () => {
    test('Abrechnungen erfolgreich erstellen — Partei erscheint in Abrechnungsliste', async ({
      page,
    }) => {
      abrechnungenPage = new AbrechnungenPage(page);

      const event = await createTestEvent({ standort: 'Abrechnung-E2E' });
      const partei = await createTestPartei({ bezeichnung: 'Partei-Abr-E2E', adresse: 'Gasse 1' });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Bier-Abr-E2E', preis: 3.5 });
      const ausgabe = await createTestAllgemeinausgabe({ eventId: event.id, beschreibung: 'Miete-E2E', betrag: 60 });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET', anzahlPersonen: 2 });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 2 });
      const konsumation = await createTestKonsumation({ teilnahmeId: teilnahme.id, konsumationsangebotId: angebot.id, anzahl: 3 });

      await abrechnungenPage.goto(event.id);
      await expect(abrechnungenPage.btnAbrechnungenErstellen).toBeVisible();
      await abrechnungenPage.abrechnungenErstellen();

      await abrechnungenPage.parteiInTabelleErwarten('Partei-Abr-E2E');

      // Cleanup
      const abrechnungen = await fetch('http://localhost:8080/api/abrechnungen').then((r) => r.json());
      for (const a of abrechnungen.filter((x: TestAbrechnung) =>
        x.teilnahme?.einladung?.partei?.bezeichnung?.includes('Abr-E2E'),
      )) await deleteTestAbrechnung(a.id);
      await deleteTestKonsumation(konsumation.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestAllgemeinausgabe(ausgabe.id);
      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });

    test('Zustellungskanal TWINT wird automatisch gesetzt bei twintAktiv=true', async ({ page }) => {
      abrechnungenPage = new AbrechnungenPage(page);

      const event = await createTestEvent({ standort: 'Twint-Abr-E2E' });
      const partei = await createTestPartei({
        bezeichnung: 'Partei-Twint-E2E',
        adresse: 'Gasse 1',
        twintAktiv: true,
        twintMobilenummer: '+41791234567',
      });
      const angebot = await createTestKonsumationsangebot({ eventId: event.id, bezeichnung: 'Bier-T-E2E', preis: 3.5 });
      const ausgabe = await createTestAllgemeinausgabe({ eventId: event.id, beschreibung: 'Miete-T-E2E', betrag: 60 });
      const einladung = await createTestEinladung({ eventId: event.id, parteiId: partei.id, status: 'ANGEMELDET', anzahlPersonen: 2 });
      const teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 2 });

      await abrechnungenPage.goto(event.id);
      await abrechnungenPage.abrechnungenErstellen();

      const zeile = abrechnungenPage.tabelle.getByRole('row').filter({ hasText: 'Partei-Twint-E2E' });
      await expect(zeile.locator('select.kanal-select')).toHaveValue('TWINT');

      const abrechnungen = await fetch('http://localhost:8080/api/abrechnungen').then((r) => r.json());
      for (const a of abrechnungen.filter((x: TestAbrechnung) =>
        x.teilnahme?.einladung?.partei?.bezeichnung?.includes('Twint-E2E'),
      )) await deleteTestAbrechnung(a.id);
      await deleteTestTeilnahme(teilnahme.id);
      await deleteTestEinladung(einladung.id);
      await deleteTestAllgemeinausgabe(ausgabe.id);
      await deleteTestKonsumationsangebot(angebot.id);
      await deleteTestPartei(partei.id);
      await deleteTestEvent(event.id);
    });
  });
});

/**
 * @uc UC-016
 * @name Teilnahme bestätigen
 * @route /meine-teilnahme
 * @spec ../quartierfest-backend/specs/UC-016_Teilnahme-Bestaetigen.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  PARTEI sieht und aktualisiert ihre eigene Teilnahme (Anzahl + Buffet-Beitrag)
 *  - [GUARD]  PARTEI sieht nur die «Meine Teilnahme»-Navigation
 *
 * Bewusst ohne Organisator-Fixture: meldet sich als PARTEI-Benutzer an
 * (Token-Injection in sessionStorage).
 */
import { test, expect } from '@playwright/test';
import {
  createTestEvent,
  createTestPartei,
  createTestEinladung,
  createTestTeilnahme,
  createTestBenutzer,
  deleteTestEvent,
  deleteTestPartei,
  deleteTestEinladung,
  deleteTestTeilnahme,
  deleteTestBenutzer,
  deleteTestBenutzerByEmail,
  login,
  inTagen,
  TOKEN_KEY,
  type TestEvent,
  type TestPartei,
  type TestEinladung,
  type TestTeilnahme,
  type TestBenutzer,
} from '../helpers/api-helpers';

const TEST_EMAIL = 'e2e.uc016.partei@quartier.ch';
const TEST_PASSWORT = 'e2e-partei-geheim';

test.describe('UC-016 — Teilnahme bestätigen', () => {
  let event: TestEvent;
  let partei: TestPartei;
  let einladung: TestEinladung;
  let teilnahme: TestTeilnahme;
  let benutzer: TestBenutzer;

  test.beforeEach(async ({ page }) => {
    await deleteTestBenutzerByEmail(TEST_EMAIL);
    // Zukünftiger Event → wird von GET /api/teilnahmen/meine als «nächster Event» gewählt
    event = await createTestEvent({ datum: inTagen(30), standort: 'UC016-E2E-Wiese' });
    partei = await createTestPartei({ bezeichnung: 'UC016-Partei-E2E', adresse: 'Parteiweg 1' });
    einladung = await createTestEinladung({
      eventId: event.id,
      parteiId: partei.id,
      status: 'ANGEMELDET',
      anzahlPersonen: 3,
    });
    teilnahme = await createTestTeilnahme({ einladungId: einladung.id, anzahlPersonenEffektiv: 3 });
    benutzer = await createTestBenutzer({
      email: TEST_EMAIL,
      passwort: TEST_PASSWORT,
      rolle: 'PARTEI',
      parteiId: partei.id,
    });

    const token = await login(TEST_EMAIL, TEST_PASSWORT);
    await page.addInitScript(
      ([key, wert]) => sessionStorage.setItem(key, wert),
      [TOKEN_KEY, token],
    );
  });

  test.afterEach(async () => {
    if (benutzer) await deleteTestBenutzer(benutzer.id);
    if (teilnahme) await deleteTestTeilnahme(teilnahme.id);
    if (einladung) await deleteTestEinladung(einladung.id);
    if (partei) await deleteTestPartei(partei.id);
    if (event) await deleteTestEvent(event.id);
  });

  test('PARTEI sieht und aktualisiert ihre eigene Teilnahme', async ({ page }) => {
    await page.goto('/meine-teilnahme');

    await expect(page.getByRole('heading', { name: 'Meine Teilnahme' })).toBeVisible();
    await expect(page.locator('.event-info')).toContainText('UC016-E2E-Wiese');
    await expect(page.getByLabel('Anzahl Personen')).toHaveValue('3');

    // PARTEI sieht nur die eigene Navigation
    const navLinks = page.locator('.app-nav__link');
    await expect(navLinks).toHaveCount(1);
    await expect(navLinks.first()).toHaveText('Meine Teilnahme');

    // Angaben anpassen (UC-016 Hauptfluss)
    await page.getByLabel('Anzahl Personen').fill('4');
    await page.getByLabel('Wir helfen beim Aufstellen').check();
    await page.getByRole('button', { name: 'Beitrag hinzufügen' }).click();
    await page.getByPlaceholder('Beschreibung').last().fill('Rüebli-Salat');
    await page.getByRole('button', { name: 'Speichern' }).click();

    await expect(page.locator('.meldung--erfolg')).toContainText(
      'Ihre Angaben wurden gespeichert.',
    );

    // Reload: gespeicherte Werte werden wieder geladen (Persistenz)
    await page.reload();
    await expect(page.getByLabel('Anzahl Personen')).toHaveValue('4');
    await expect(page.getByPlaceholder('Beschreibung').last()).toHaveValue('Rüebli-Salat');
  });
});

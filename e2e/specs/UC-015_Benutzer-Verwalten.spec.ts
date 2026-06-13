/**
 * @uc UC-015
 * @name Benutzer verwalten
 * @route /admin/benutzer
 * @spec ../quartierfest-backend/specs/UC-015_Benutzer-Verwalten.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  PARTEI-Account mit Partei-Zuordnung anlegen
 *  - [HAPPY]  Account löschen
 *  - [ERROR]  Doppelte E-Mail-Adresse wird abgewiesen (E2)
 */
import { test, expect } from '../fixtures';
import {
  createTestPartei,
  deleteTestPartei,
  deleteTestBenutzerByEmail,
  type TestPartei,
} from '../helpers/api-helpers';

const TEST_EMAIL = 'e2e.uc015.partei@quartier.ch';

test.describe('UC-015 — Benutzer verwalten', () => {
  let partei: TestPartei;

  test.beforeEach(async ({ page }) => {
    await deleteTestBenutzerByEmail(TEST_EMAIL);
    partei = await createTestPartei({ bezeichnung: 'UC015-Partei-E2E', adresse: 'Adminweg 1' });
    await page.goto('/admin/benutzer');
    await expect(page.getByRole('heading', { name: 'Benutzerverwaltung' })).toBeVisible();
  });

  test.afterEach(async () => {
    await deleteTestBenutzerByEmail(TEST_EMAIL);
    await deleteTestPartei(partei.id);
  });

  test('PARTEI-Account anlegen, Duplikat abweisen und Account löschen', async ({ page }) => {
    // Account anlegen
    await page.getByLabel('E-Mail-Adresse').fill(TEST_EMAIL);
    await page.getByLabel('Initialpasswort (mind. 10 Zeichen)').fill('e2e-geheim-123');
    await page.getByLabel('Rolle').selectOption('PARTEI');
    await page.getByLabel('Partei').selectOption({ label: 'UC015-Partei-E2E' });
    await page.getByRole('button', { name: 'Account anlegen' }).click();

    await expect(page.locator('.meldung--erfolg')).toContainText(TEST_EMAIL);
    const zeile = page.getByRole('row', { name: new RegExp(TEST_EMAIL) });
    await expect(zeile).toBeVisible();
    await expect(zeile).toContainText('UC015-Partei-E2E');

    // Duplikat wird abgewiesen (UC-015 E2)
    await page.getByLabel('E-Mail-Adresse').fill(TEST_EMAIL);
    await page.getByLabel('Initialpasswort (mind. 10 Zeichen)').fill('anderes-geheim-99');
    await page.getByLabel('Rolle').selectOption('PARTEI');
    await page.getByLabel('Partei').selectOption({ label: 'UC015-Partei-E2E' });
    await page.getByRole('button', { name: 'Account anlegen' }).click();

    await expect(page.locator('.meldung--fehler')).toContainText(
      'Für diese E-Mail-Adresse existiert bereits ein Account.',
    );

    // Account löschen (Bestätigungsdialog akzeptieren)
    page.once('dialog', (dialog) => dialog.accept());
    await zeile.getByRole('button', { name: 'Löschen' }).click();

    await expect(page.getByRole('row', { name: new RegExp(TEST_EMAIL) })).toHaveCount(0);
  });
});

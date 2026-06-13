/**
 * @uc UC-014
 * @name Benutzer anmelden
 * @route /login
 * @spec ../quartierfest-backend/specs/UC-014_Benutzer-Anmelden.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Organisator meldet sich erfolgreich an → /personen
 *  - [HAPPY]  Abmelden beendet die Sitzung
 *  - [ERROR]  Falsches Passwort → generische Fehlermeldung (E1)
 *  - [GUARD]  Unauthentifizierter Zugriff auf geschützte Route → /login
 *
 * Bewusst ohne Auto-Login-Fixture: hier wird der UI-Login selbst getestet.
 */
import { test, expect } from '@playwright/test';
import { ORGANISATOR_EMAIL, ORGANISATOR_PASSWORT } from '../helpers/api-helpers';

test.describe('UC-014 — Benutzer anmelden', () => {
  test('Unauthentifizierter Zugriff auf geschützte Route wird auf /login umgeleitet', async ({
    page,
  }) => {
    await page.goto('/personen');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Anmelden' })).toBeVisible();
  });

  test('Organisator meldet sich erfolgreich an', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-Mail-Adresse').fill(ORGANISATOR_EMAIL);
    await page.getByLabel('Passwort').fill(ORGANISATOR_PASSWORT);
    await page.getByRole('button', { name: 'Anmelden' }).click();

    await expect(page).toHaveURL(/\/personen$/);
    await expect(page.getByRole('heading', { name: 'Personenverwaltung' })).toBeVisible();
    // Navigation und Abmelde-Knopf sind sichtbar
    await expect(page.getByRole('button', { name: 'Abmelden' })).toBeVisible();
  });

  test('Anmeldung mit falschem Passwort zeigt generische Fehlermeldung', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-Mail-Adresse').fill(ORGANISATOR_EMAIL);
    await page.getByLabel('Passwort').fill('voellig-falsch');
    await page.getByRole('button', { name: 'Anmelden' }).click();

    await expect(page.getByRole('alert')).toContainText('E-Mail-Adresse oder Passwort falsch.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Abmelden beendet die Sitzung', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-Mail-Adresse').fill(ORGANISATOR_EMAIL);
    await page.getByLabel('Passwort').fill(ORGANISATOR_PASSWORT);
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page).toHaveURL(/\/personen$/);

    await page.getByRole('button', { name: 'Abmelden' }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Sitzung ist weg: geschützte Route führt wieder zum Login
    await page.goto('/personen');
    await expect(page).toHaveURL(/\/login$/);
  });
});

import { type Page, expect } from '@playwright/test';

/**
 * Wählt einen Event im EventKontextService-Dropdown aus.
 * Der Dropdown befindet sich in der event-kontext-bar oben auf allen event-abhängigen Seiten.
 */
export async function eventAuswaehlen(page: Page, eventId: number): Promise<void> {
  const selektor = page.locator('.event-kontext-bar__select');
  await expect(selektor).toBeVisible();
  await selektor.selectOption(String(eventId));
}

/**
 * Navigiert zu einer event-abhängigen Route und wählt direkt den Event aus.
 */
export async function gotoMitEventKontext(
  page: Page,
  route: string,
  eventId: number,
): Promise<void> {
  await page.goto(route);
  await eventAuswaehlen(page, eventId);
}

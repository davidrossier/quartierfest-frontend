/**
 * Gemeinsame Playwright-Fixtures (UC-014, AUTH-002).
 *
 * Seit der Einführung der Route Guards brauchen alle Organisator-Specs eine
 * Sitzung. Diese Fixture injiziert das Token des Bootstrap-Organisators vor
 * jedem Seitenaufbau in sessionStorage — schneller und stabiler als ein
 * UI-Login pro Test. Der UI-Login selbst wird in UC-014 explizit getestet.
 *
 * Verwendung: `import { test, expect } from '../fixtures';`
 * Specs ohne Auto-Login (UC-014, UC-016) importieren weiterhin '@playwright/test'.
 */
import { test as base, expect } from '@playwright/test';
import { getOrganisatorToken, TOKEN_KEY } from './helpers/api-helpers';

export const test = base.extend({
  page: async ({ page }, use) => {
    const token = await getOrganisatorToken();
    await page.addInitScript(
      ([key, wert]) => sessionStorage.setItem(key, wert),
      [TOKEN_KEY, token],
    );
    await use(page);
  },
});

export { expect };

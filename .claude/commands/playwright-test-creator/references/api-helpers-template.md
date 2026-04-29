# API Helpers — Vorlage für Test-Setup

Datei: `e2e/helpers/api-helpers.ts`

## Vollständige Vorlage

```typescript
/**
 * API Helpers für Playwright Test-Setup und -Teardown
 * Backend: http://localhost:8080
 *
 * Alle Funktionen kommunizieren direkt mit der REST API,
 * um Test-State ohne UI-Interaktion aufzubauen.
 */

const BASE_URL = 'http://localhost:8080';

// ================================================================
// Typen (aus Backend-DTOs ableiten)
// ================================================================

export interface TestPerson {
  id: number;
  vorname: string;
  nachname: string;
}

export interface TestPartei {
  id: number;
  name: string;
  twintNummer?: string;
}

export interface TestEvent {
  id: number;
  name: string;
  datum: string;
}

// ================================================================
// Personen
// ================================================================

export async function createTestPerson(
  daten: Partial<Pick<TestPerson, 'vorname' | 'nachname'>> = {}
): Promise<TestPerson> {
  const response = await fetch(`${BASE_URL}/api/persons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vorname: daten.vorname ?? 'Test',
      nachname: daten.nachname ?? `Person-${Date.now()}`,
    }),
  });
  if (!response.ok) throw new Error(`Person erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestPerson(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/persons/${id}`, { method: 'DELETE' });
}

// ================================================================
// Parteien
// ================================================================

export async function createTestPartei(
  daten: Partial<Pick<TestPartei, 'name' | 'twintNummer'>> = {}
): Promise<TestPartei> {
  const response = await fetch(`${BASE_URL}/api/parteien`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: daten.name ?? `Testpartei-${Date.now()}`,
      twintNummer: daten.twintNummer,
    }),
  });
  if (!response.ok) throw new Error(`Partei erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestPartei(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/parteien/${id}`, { method: 'DELETE' });
}

// ================================================================
// Events
// ================================================================

export async function createTestEvent(
  daten: Partial<Pick<TestEvent, 'name' | 'datum'>> = {}
): Promise<TestEvent> {
  const response = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: daten.name ?? `Testfest-${Date.now()}`,
      datum: daten.datum ?? new Date().toISOString().split('T')[0],
    }),
  });
  if (!response.ok) throw new Error(`Event erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestEvent(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/events/${id}`, { method: 'DELETE' });
}

// ================================================================
// Cleanup-Utility
// ================================================================

/**
 * Löscht alle übergebenen Test-Ressourcen.
 * Fehler beim Löschen werden geloggt aber nicht weitergeworfen,
 * damit andere Cleanup-Schritte nicht blockiert werden.
 */
export async function cleanupTestData(resources: {
  personen?: TestPerson[];
  parteien?: TestPartei[];
  events?: TestEvent[];
}): Promise<void> {
  const tasks: Promise<void>[] = [];

  for (const p of resources.personen ?? []) {
    tasks.push(deleteTestPerson(p.id).catch(e => console.warn(`Cleanup Person ${p.id}:`, e)));
  }
  for (const p of resources.parteien ?? []) {
    tasks.push(deleteTestPartei(p.id).catch(e => console.warn(`Cleanup Partei ${p.id}:`, e)));
  }
  for (const e of resources.events ?? []) {
    tasks.push(deleteTestEvent(e.id).catch(e => console.warn(`Cleanup Event ${e.id}:`, e)));
  }

  await Promise.all(tasks);
}
```

## Verwendung im beforeEach/afterEach

```typescript
test.describe('UC-001', () => {
  let person: TestPerson;
  let event: TestEvent;

  test.beforeEach(async () => {
    event = await createTestEvent({ name: 'Sommerfest 2025' });
    person = await createTestPerson({ vorname: 'Anna', nachname: 'Muster' });
  });

  test.afterEach(async () => {
    await cleanupTestData({ personen: [person], events: [event] });
  });
});
```

## Wichtig: IDs niemals hardcoden

```typescript
// ❌ Falsch
await page.goto('/parteien/42'); // ID aus Datenbank hardcodiert

// ✅ Richtig
const partei = await createTestPartei();
await page.goto(`/parteien/${partei.id}`);
```

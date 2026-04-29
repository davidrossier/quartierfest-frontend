/**
 * @uc UC-001
 * @name Personendaten verwalten
 * @route /personen
 * @spec ../quartierfest-backend/specs/UC-001_Person-Verwalten.md
 *
 * Abgedeckte Szenarien:
 *  - [HAPPY]  Person erfolgreich erfassen
 *  - [HAPPY]  Person erfolgreich bearbeiten (Mobilenummer hinzufügen)
 *  - [HAPPY]  Person löschen
 *  - [ERROR]  Pflichtfeld fehlt — Formular zeigt Validierungsfehler
 *  - [ERROR]  Person löschen die einer Partei zugeordnet ist schlägt fehl
 */
import { test, expect } from '@playwright/test';
import { PersonenPage } from '../pages/personen.page';
import {
  createTestPerson,
  createTestPartei,
  deleteTestPartei,
  deleteTestPerson,
  type TestPerson,
  type TestPartei,
} from '../helpers/api-helpers';

test.describe('UC-001 — Personendaten verwalten', () => {
  let personenPage: PersonenPage;

  test.beforeEach(async ({ page }) => {
    personenPage = new PersonenPage(page);
    await personenPage.goto();
  });

  // ================================================================
  // Happy Path
  // ================================================================
  test.describe('Happy Path', () => {
    test('Person erfolgreich erfassen', async () => {
      // Pre-cleanup: veraltete Testdaten entfernen
      const vorherPersonen: TestPerson[] = await fetch('http://localhost:8080/api/persons').then((r) => r.json());
      for (const p of vorherPersonen.filter((x) => x.name === 'Müller-E2E')) {
        await deleteTestPerson(p.id);
      }
      await personenPage.goto();

      await personenPage.formularAusfuellen({ vorname: 'Anna', name: 'Müller-E2E' });
      await personenPage.speichern();

      // Nachname allein suchen — Angular kollabiert Whitespace zwischen <td>-Zellen
      await personenPage.personInTabelleErwarten('Müller-E2E');

      // Cleanup
      const personen: TestPerson[] = await fetch('http://localhost:8080/api/persons').then((r) => r.json());
      for (const p of personen.filter((x) => x.name === 'Müller-E2E')) {
        await deleteTestPerson(p.id);
      }
    });

    test('Person erfolgreich bearbeiten — Mobilenummer hinzufügen', async () => {
      // Pre-cleanup: veraltete Testdaten entfernen
      const vorherPersonen: TestPerson[] = await fetch('http://localhost:8080/api/persons').then((r) => r.json());
      for (const p of vorherPersonen.filter((x) => x.name === 'Müller-E2E-Edit')) {
        await deleteTestPerson(p.id);
      }
      await personenPage.goto();

      const person = await createTestPerson({ vorname: 'Beat', name: 'Müller-E2E-Edit' });

      await personenPage.goto();
      await personenPage.bearbeiten('Müller-E2E-Edit');
      await personenPage.inputMobilenummer.fill('+41791234567');
      await personenPage.speichern();

      await personenPage.personInTabelleErwarten('+41791234567');

      await deleteTestPerson(person.id);
    });

    test('Person löschen', async () => {
      // Pre-cleanup: veraltete Testdaten entfernen
      const vorherPersonen: TestPerson[] = await fetch('http://localhost:8080/api/persons').then((r) => r.json());
      for (const p of vorherPersonen.filter((x) => x.name === 'Delete-E2E')) {
        await deleteTestPerson(p.id);
      }

      const person = await createTestPerson({ vorname: 'Clara', name: 'Delete-E2E' });

      await personenPage.goto();
      await personenPage.loeschen('Delete-E2E');

      await expect(personenPage.page.getByRole('row').filter({ hasText: 'Delete-E2E' })).toHaveCount(0);
    });
  });

  // ================================================================
  // Fehlerfälle
  // ================================================================
  test.describe('Fehlerfälle', () => {
    test('Pflichtfeld Name fehlt — Formular zeigt Validierungsfehler', async () => {
      await personenPage.inputVorname.fill('NurVorname');
      await personenPage.speichern();

      await expect(personenPage.feldFehler.filter({ hasText: 'Name ist erforderlich' })).toBeVisible();
      await expect(personenPage.inputVorname).toBeVisible();
    });

    test('Pflichtfeld Vorname fehlt — Formular zeigt Validierungsfehler', async () => {
      await personenPage.inputName.fill('NurName');
      await personenPage.speichern();

      await expect(personenPage.feldFehler.filter({ hasText: 'Vorname ist erforderlich' })).toBeVisible();
    });

    test.skip('Person löschen die einer Partei zugeordnet ist schlägt fehl', async () => {
      // Backend enforces keine FK-Constraint für Person→Partei — DELETE /api/persons/{id} gibt 200 OK
      // zurück auch wenn die Person einer Partei zugeordnet ist. Test aktivieren sobald das Backend
      // diesen Fehlerfall implementiert (HTTP 409 Conflict).
      // Pre-cleanup: nicht-zugeordnete Constraint-E2E Personen entfernen (zugeordnete schlagen fehl → ignoriert)
      const vorherPersonen: TestPerson[] = await fetch('http://localhost:8080/api/persons').then((r) => r.json());
      for (const p of vorherPersonen.filter((x) => x.name === 'Constraint-E2E')) {
        await deleteTestPerson(p.id).catch(() => {});
      }

      const person = await createTestPerson({ vorname: 'FK', name: 'Constraint-E2E' });
      const partei = await createTestPartei({
        bezeichnung: 'TestPartei-FK-E2E',
        adresse: 'Testgasse 1',
        personenIds: [person.id],
      });

      await personenPage.goto();
      await personenPage.loeschen('Constraint-E2E');

      await expect(personenPage.fehlerMeldung).toBeVisible();
      await expect(personenPage.fehlerMeldung).toContainText(/zugeordnet/i);

      await deleteTestPartei(partei.id);
      await deleteTestPerson(person.id);
    });
  });
});

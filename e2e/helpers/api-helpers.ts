/**
 * API Helpers für Playwright Test-Setup und -Teardown
 * Backend: http://localhost:8080
 *
 * Alle Funktionen kommunizieren direkt mit der REST API,
 * um Test-State ohne UI-Interaktion aufzubauen.
 */

const BASE_URL = 'http://localhost:8080';

// ================================================================
// Typen
// ================================================================

export interface TestPerson {
  id: number;
  vorname: string;
  name: string;
  telefonnummer?: string;
  mobilenummer?: string;
  email?: string;
}

export interface TestPartei {
  id: number;
  bezeichnung: string;
  adresse: string;
  twintAktiv: boolean;
  twintMobilenummer?: string;
  personen: TestPerson[];
}

export interface TestEvent {
  id: number;
  datum: string;
  startzeit: string;
  standort: string;
  alternativerStandort?: string;
}

export interface TestEinladung {
  id: number;
  event: { id: number };
  partei: { id: number; bezeichnung: string };
  status: 'OFFEN' | 'ANGEMELDET' | 'ABGEMELDET';
  anzahlPersonen?: number;
  bestaetigungVersendet: boolean;
}

export interface TestTeilnahme {
  id: number;
  einladung: { id: number; partei: { id: number; bezeichnung: string }; event: { id: number } };
  anzahlPersonenEffektiv?: number;
  buffetBeitraege: Array<{ art: string; beschreibung?: string }>;
}

export interface TestKonsumationsangebot {
  id: number;
  bezeichnung: string;
  preis: number;
}

export interface TestAllgemeinausgabe {
  id: number;
  beschreibung: string;
  betrag: number;
  herkunft?: string;
}

export interface TestKonsumation {
  id: number;
  teilnahme: { id: number };
  konsumationsangebot: { id: number };
  anzahl: number;
}

export interface TestAbrechnung {
  id: number;
  teilnahme: { id: number; einladung: { partei: { bezeichnung: string } } };
  anteilAllgemeinkosten: number;
  totalKonsumation: number;
  totalBetrag: number;
  zustellungskanal: 'TWINT' | 'EMAIL' | 'PAPIER';
  zustellungsDatum?: string;
}

export interface TestZahlung {
  id: number;
  abrechnung: { id: number };
  zahlungskanal: 'TWINT' | 'UEBERWEISUNG' | 'BAR';
  datum: string;
  betrag: number;
}

export interface TestMahnung {
  id: number;
  abrechnung: { id: number };
  datum: string;
  bemerkung?: string;
}

// ================================================================
// Personen
// ================================================================

export async function createTestPerson(
  daten: Partial<Pick<TestPerson, 'vorname' | 'name' | 'mobilenummer'>> = {},
): Promise<TestPerson> {
  const response = await fetch(`${BASE_URL}/api/persons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vorname: daten.vorname ?? 'Test',
      name: daten.name ?? `Person-${Date.now()}`,
      mobilenummer: daten.mobilenummer,
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
  daten: Partial<
    Pick<TestPartei, 'bezeichnung' | 'adresse' | 'twintAktiv' | 'twintMobilenummer'>
  > & { personenIds?: number[] } = {},
): Promise<TestPartei> {
  const response = await fetch(`${BASE_URL}/api/parteien`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bezeichnung: daten.bezeichnung ?? `Testpartei-${Date.now()}`,
      adresse: daten.adresse ?? 'Teststrasse 1, 3000 Bern',
      twintAktiv: daten.twintAktiv ?? false,
      twintMobilenummer: daten.twintMobilenummer,
      personenIds: daten.personenIds ?? [],
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
  daten: Partial<Pick<TestEvent, 'datum' | 'startzeit' | 'standort'>> = {},
): Promise<TestEvent> {
  const response = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      datum: daten.datum ?? '2025-07-05',
      startzeit: daten.startzeit ?? '17:00',
      standort: daten.standort ?? `Testwiese-${Date.now()}`,
    }),
  });
  if (!response.ok) throw new Error(`Event erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestEvent(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/events/${id}`, { method: 'DELETE' });
}

// ================================================================
// Einladungen
// ================================================================

export async function createTestEinladung(daten: {
  eventId: number;
  parteiId: number;
  status?: 'OFFEN' | 'ANGEMELDET' | 'ABGEMELDET';
  anzahlPersonen?: number;
  hilftAufstellen?: boolean;
  hilftAufraumen?: boolean;
  buffetBeitrag?: 'KEINER' | 'SALAT' | 'BROT_ZOPF' | 'DESSERT' | 'WEITERE';
}): Promise<TestEinladung> {
  const response = await fetch(`${BASE_URL}/api/einladungen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: { id: daten.eventId },
      partei: { id: daten.parteiId },
      status: daten.status ?? 'OFFEN',
      anzahlPersonen: daten.anzahlPersonen,
      hilftAufstellen: daten.hilftAufstellen,
      hilftAufraumen: daten.hilftAufraumen,
      buffetBeitrag: daten.buffetBeitrag ?? 'KEINER',
      bestaetigungVersendet: false,
    }),
  });
  if (!response.ok) throw new Error(`Einladung erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestEinladung(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/einladungen/${id}`, { method: 'DELETE' });
}

// ================================================================
// Teilnahmen
// ================================================================

export async function createTestTeilnahme(daten: {
  einladungId: number;
  anzahlPersonenEffektiv?: number;
}): Promise<TestTeilnahme> {
  const response = await fetch(`${BASE_URL}/api/teilnahmen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      einladung: { id: daten.einladungId },
      anzahlPersonenEffektiv: daten.anzahlPersonenEffektiv ?? 2,
      buffetBeitraege: [],
    }),
  });
  if (!response.ok) throw new Error(`Teilnahme erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestTeilnahme(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/teilnahmen/${id}`, { method: 'DELETE' });
}

// ================================================================
// Konsumationsangebote
// ================================================================

export async function createTestKonsumationsangebot(daten: {
  eventId: number;
  bezeichnung?: string;
  preis?: number;
}): Promise<TestKonsumationsangebot> {
  const response = await fetch(`${BASE_URL}/api/konsumationsangebote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: { id: daten.eventId },
      bezeichnung: daten.bezeichnung ?? `Testgetränk-${Date.now()}`,
      preis: daten.preis ?? 3.5,
    }),
  });
  if (!response.ok)
    throw new Error(`Konsumationsangebot erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestKonsumationsangebot(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/konsumationsangebote/${id}`, { method: 'DELETE' });
}

// ================================================================
// Allgemeinausgaben
// ================================================================

export async function createTestAllgemeinausgabe(daten: {
  eventId: number;
  beschreibung?: string;
  betrag?: number;
  herkunft?: string;
}): Promise<TestAllgemeinausgabe> {
  const response = await fetch(`${BASE_URL}/api/allgemeinausgaben`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: { id: daten.eventId },
      beschreibung: daten.beschreibung ?? 'Testausgabe',
      betrag: daten.betrag ?? 100,
      herkunft: daten.herkunft,
    }),
  });
  if (!response.ok)
    throw new Error(`Allgemeinausgabe erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestAllgemeinausgabe(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/allgemeinausgaben/${id}`, { method: 'DELETE' });
}

// ================================================================
// Konsumationen
// ================================================================

export async function createTestKonsumation(daten: {
  teilnahmeId: number;
  konsumationsangebotId: number;
  anzahl: number;
}): Promise<TestKonsumation> {
  const response = await fetch(`${BASE_URL}/api/konsumationen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teilnahme: { id: daten.teilnahmeId },
      konsumationsangebot: { id: daten.konsumationsangebotId },
      anzahl: daten.anzahl,
    }),
  });
  if (!response.ok) throw new Error(`Konsumation erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestKonsumation(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/konsumationen/${id}`, { method: 'DELETE' });
}

// ================================================================
// Abrechnungen
// ================================================================

export async function createTestAbrechnung(daten: {
  teilnahmeId: number;
  anteilAllgemeinkosten: number;
  totalKonsumation: number;
  totalBetrag: number;
  zustellungskanal?: 'TWINT' | 'EMAIL' | 'PAPIER';
}): Promise<TestAbrechnung> {
  const response = await fetch(`${BASE_URL}/api/abrechnungen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teilnahme: { id: daten.teilnahmeId },
      anteilAllgemeinkosten: daten.anteilAllgemeinkosten,
      totalKonsumation: daten.totalKonsumation,
      totalBetrag: daten.totalBetrag,
      zustellungskanal: daten.zustellungskanal ?? 'EMAIL',
    }),
  });
  if (!response.ok) throw new Error(`Abrechnung erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestAbrechnung(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/abrechnungen/${id}`, { method: 'DELETE' });
}

// ================================================================
// Zahlungen
// ================================================================

export async function createTestZahlung(daten: {
  abrechnungId: number;
  zahlungskanal?: 'TWINT' | 'UEBERWEISUNG' | 'BAR';
  datum?: string;
  betrag: number;
}): Promise<TestZahlung> {
  const response = await fetch(`${BASE_URL}/api/zahlungen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      abrechnung: { id: daten.abrechnungId },
      zahlungskanal: daten.zahlungskanal ?? 'TWINT',
      datum: daten.datum ?? new Date().toISOString().substring(0, 10),
      betrag: daten.betrag,
    }),
  });
  if (!response.ok) throw new Error(`Zahlung erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestZahlung(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/zahlungen/${id}`, { method: 'DELETE' });
}

// ================================================================
// Mahnungen
// ================================================================

export async function createTestMahnung(daten: {
  abrechnungId: number;
  datum?: string;
  bemerkung?: string;
}): Promise<TestMahnung> {
  const response = await fetch(`${BASE_URL}/api/mahnungen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      abrechnung: { id: daten.abrechnungId },
      datum: daten.datum ?? new Date().toISOString().substring(0, 10),
      bemerkung: daten.bemerkung,
    }),
  });
  if (!response.ok) throw new Error(`Mahnung erstellen fehlgeschlagen: ${response.status}`);
  return response.json();
}

export async function deleteTestMahnung(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/mahnungen/${id}`, { method: 'DELETE' });
}

// ================================================================
// Hilfsfunktion: Heute als ISO-Datum
// ================================================================

export function heute(): string {
  return new Date().toISOString().substring(0, 10);
}

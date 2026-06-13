import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MeineTeilnahmeComponent } from './meine-teilnahme.component';
import { Teilnahme } from '../teilnahmen/teilnahme.model';
import { environment } from '../../environments/environment';

const teilnahme: Teilnahme = {
  id: 4,
  einladung: {
    id: 3,
    event: { id: 1, datum: '2026-08-15', standort: 'Buchlenwiese' },
    partei: { id: 2, bezeichnung: 'Familie Müller' },
    status: 'ANGEMELDET',
  },
  anzahlPersonenEffektiv: 3,
  hilftAufstellen: true,
  hilftAufraumen: false,
  buffetBeitraege: [{ art: 'SALAT', beschreibung: 'Grüner Salat' }],
};

describe('MeineTeilnahmeComponent (UC-016)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeineTeilnahmeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lädt die eigene Teilnahme und befüllt das Formular', () => {
    const fixture = TestBed.createComponent(MeineTeilnahmeComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/api/teilnahmen/meine`).flush(teilnahme);

    const component = fixture.componentInstance;
    expect(component.teilnahme()?.id).toBe(4);
    expect(component.form.value.anzahlPersonenEffektiv).toBe(3);
    expect(component.buffetBeitraege.length).toBe(1);
  });

  it('zeigt den Hinweis, wenn noch keine Teilnahme existiert (UC-016 E1)', () => {
    const fixture = TestBed.createComponent(MeineTeilnahmeComponent);
    fixture.detectChanges();
    httpMock
      .expectOne(`${environment.apiUrl}/api/teilnahmen/meine`)
      .flush({}, { status: 404, statusText: 'Not Found' });

    expect(fixture.componentInstance.keineTeilnahme()).toBe(true);
  });

  it('speichert die Whitelist-Felder via PUT (UC-016 Hauptfluss)', () => {
    const fixture = TestBed.createComponent(MeineTeilnahmeComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/api/teilnahmen/meine`).flush(teilnahme);
    const component = fixture.componentInstance;

    component.form.patchValue({ anzahlPersonenEffektiv: 4 });
    component.beitragHinzufuegen();
    component.speichern();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/teilnahmen/4`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.anzahlPersonenEffektiv).toBe(4);
    expect(req.request.body.buffetBeitraege.length).toBe(2);
    // Whitelist: einladung ist nie Teil des Payloads
    expect('einladung' in req.request.body).toBe(false);
    req.flush({ ...teilnahme, anzahlPersonenEffektiv: 4 });

    expect(component.erfolg()).toBe('Ihre Angaben wurden gespeichert.');
  });
});

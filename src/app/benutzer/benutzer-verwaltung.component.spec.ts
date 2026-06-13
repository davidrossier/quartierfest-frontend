import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BenutzerVerwaltungComponent } from './benutzer-verwaltung.component';
import { environment } from '../../environments/environment';

describe('BenutzerVerwaltungComponent (UC-015)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenutzerVerwaltungComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function createComponent() {
    const fixture = TestBed.createComponent(BenutzerVerwaltungComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/api/benutzer`).flush([
      { id: 1, email: 'admin@quartierfest.local', rolle: 'ORGANISATOR', partei: null },
      {
        id: 2,
        email: 'mueller@quartier.ch',
        rolle: 'PARTEI',
        partei: { id: 1, bezeichnung: 'Familie Müller' },
      },
    ]);
    httpMock
      .expectOne(`${environment.apiUrl}/api/parteien`)
      .flush([{ id: 1, bezeichnung: 'Familie Müller', adresse: 'Weg 1', twintAktiv: false, personen: [] }]);
    return fixture;
  }

  it('lädt und zeigt alle Benutzeraccounts', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.benutzer().length).toBe(2);
    expect(fixture.componentInstance.parteien().length).toBe(1);
  });

  it('legt einen PARTEI-Account mit Partei-Zuordnung an', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    component.erfassenForm.setValue({
      email: 'meier@quartier.ch',
      passwort: 'geheim-1234',
      rolle: 'PARTEI',
      parteiId: 1,
    });
    component.erstellen();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/benutzer`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'meier@quartier.ch',
      passwort: 'geheim-1234',
      rolle: 'PARTEI',
      partei: { id: 1 },
    });
    req.flush({ id: 3, email: 'meier@quartier.ch', rolle: 'PARTEI', partei: { id: 1 } });
    // Liste wird neu geladen
    httpMock.expectOne(`${environment.apiUrl}/api/benutzer`).flush([]);
    expect(component.erfolg()).toContain('meier@quartier.ch');
  });

  it('verhindert PARTEI-Account ohne Partei-Zuordnung (UC-015 E1)', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    component.erfassenForm.setValue({
      email: 'meier@quartier.ch',
      passwort: 'geheim-1234',
      rolle: 'PARTEI',
      parteiId: null,
    });
    component.erstellen();

    httpMock.expectNone(`${environment.apiUrl}/api/benutzer`);
    expect(component.fehler()).toContain('Partei');
  });

  it('zeigt bei doppelter E-Mail die Konfliktmeldung (UC-015 E2)', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    component.erfassenForm.setValue({
      email: 'mueller@quartier.ch',
      passwort: 'geheim-1234',
      rolle: 'PARTEI',
      parteiId: 1,
    });
    component.erstellen();

    httpMock
      .expectOne(`${environment.apiUrl}/api/benutzer`)
      .flush({}, { status: 409, statusText: 'Conflict' });

    expect(component.fehler()).toBe('Für diese E-Mail-Adresse existiert bereits ein Account.');
  });
});

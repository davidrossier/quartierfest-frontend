import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Component({ template: '' })
class LeerComponent {}

const testRouten = [{ path: '**', component: LeerComponent }];

function fakeToken(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signatur`;
}

describe('AuthService (UC-014)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(testRouten)],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('login speichert das Token in sessionStorage und liest Rolle und E-Mail aus dem Payload', () => {
    const token = fakeToken({ sub: '42', email: 'mueller@quartier.ch', rolle: 'PARTEI' });

    service.login('mueller@quartier.ch', 'geheim-1234').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'mueller@quartier.ch', passwort: 'geheim-1234' });
    req.flush({ token });

    expect(sessionStorage.getItem('quartierfest.token')).toBe(token);
    expect(service.istAngemeldet()).toBe(true);
    expect(service.rolle()).toBe('PARTEI');
    expect(service.email()).toBe('mueller@quartier.ch');
    expect(service.startSeite()).toBe('/meine-teilnahme');
  });

  it('ORGANISATOR landet auf /personen', () => {
    const token = fakeToken({ sub: '1', email: 'orga@quartier.ch', rolle: 'ORGANISATOR' });
    service.login('orga@quartier.ch', 'admin-geheim').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/auth/login`).flush({ token });

    expect(service.rolle()).toBe('ORGANISATOR');
    expect(service.startSeite()).toBe('/personen');
  });

  it('logout entfernt das Token und meldet ab', () => {
    const token = fakeToken({ sub: '42', rolle: 'PARTEI' });
    service.login('mueller@quartier.ch', 'geheim-1234').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/auth/login`).flush({ token });

    service.logout();

    expect(sessionStorage.getItem('quartierfest.token')).toBeNull();
    expect(service.istAngemeldet()).toBe(false);
    expect(service.rolle()).toBeNull();
  });

  it('liest ein bestehendes Token aus sessionStorage (Seitenreload, UC-014 A1)', () => {
    sessionStorage.setItem(
      'quartierfest.token',
      fakeToken({ sub: '42', email: 'mueller@quartier.ch', rolle: 'PARTEI' }),
    );
    // Neuer Service-Kontext simuliert den Reload
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(testRouten)],
    });
    const neuerService = TestBed.inject(AuthService);

    expect(neuerService.istAngemeldet()).toBe(true);
    expect(neuerService.rolle()).toBe('PARTEI');
  });
});

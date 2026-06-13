import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../environments/environment';

import { Component } from '@angular/core';

@Component({ template: '' })
class LeerComponent {}

const testRouten = [{ path: '**', component: LeerComponent }];

function fakeToken(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signatur`;
}

describe('authInterceptor (UC-014)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  function init(): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter(testRouten),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  it('hängt das Bearer-Token an /api/**-Requests', () => {
    sessionStorage.setItem('quartierfest.token', fakeToken({ sub: '1', rolle: 'ORGANISATOR' }));
    init();

    http.get(`${environment.apiUrl}/api/persons`).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/persons`);

    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer header\./);
    req.flush([]);
  });

  it('sendet ohne Token keinen Authorization-Header', () => {
    init();

    http.get(`${environment.apiUrl}/api/persons`).subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/persons`);

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('verwirft die Sitzung bei 401 (UC-014 A2: Sitzung abgelaufen)', () => {
    sessionStorage.setItem('quartierfest.token', fakeToken({ sub: '1', rolle: 'ORGANISATOR' }));
    init();

    http.get(`${environment.apiUrl}/api/persons`).subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/api/persons`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(sessionStorage.getItem('quartierfest.token')).toBeNull();
  });

  it('behandelt 401 vom Login-Endpunkt nicht als Sitzungsablauf', () => {
    sessionStorage.setItem('quartierfest.token', fakeToken({ sub: '1', rolle: 'ORGANISATOR' }));
    init();

    http
      .post(`${environment.apiUrl}/api/auth/login`, { email: 'x', passwort: 'y' })
      .subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/api/auth/login`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(sessionStorage.getItem('quartierfest.token')).not.toBeNull();
  });
});

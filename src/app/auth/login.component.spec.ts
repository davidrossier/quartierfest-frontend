import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

import { Component } from '@angular/core';

@Component({ template: '' })
class LeerComponent {}

const testRouten = [{ path: '**', component: LeerComponent }];

function fakeToken(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signatur`;
}

describe('LoginComponent (UC-014)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(testRouten)],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('meldet bei gültigen Credentials an', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.loginForm.setValue({ email: 'orga@quartier.ch', passwort: 'admin-geheim' });
    component.anmelden();

    httpMock
      .expectOne(`${environment.apiUrl}/api/auth/login`)
      .flush({ token: fakeToken({ sub: '1', rolle: 'ORGANISATOR' }) });

    expect(TestBed.inject(AuthService).istAngemeldet()).toBe(true);
    expect(component.fehler()).toBeNull();
  });

  it('zeigt bei 401 die generische Fehlermeldung (UC-014 E1)', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.loginForm.setValue({ email: 'orga@quartier.ch', passwort: 'falsch' });
    component.anmelden();

    httpMock
      .expectOne(`${environment.apiUrl}/api/auth/login`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.fehler()).toBe('E-Mail-Adresse oder Passwort falsch.');
    expect(TestBed.inject(AuthService).istAngemeldet()).toBe(false);
  });

  it('sendet bei unvollständigem Formular keinen Request', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.loginForm.setValue({ email: '', passwort: '' });
    component.anmelden();

    httpMock.expectNone(`${environment.apiUrl}/api/auth/login`);
    expect(component.loginForm.invalid).toBe(true);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard, roleGuard } from './auth.guard';

function fakeToken(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signatur`;
}

const route = {} as ActivatedRouteSnapshot;
const state = {} as RouterStateSnapshot;

describe('authGuard / roleGuard (UC-014)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  afterEach(() => sessionStorage.clear());

  it('authGuard leitet ohne Sitzung auf /login um', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBeInstanceOf(UrlTree);
    expect(result!.toString()).toBe('/login');
  });

  it('authGuard lässt angemeldete Benutzer durch', () => {
    sessionStorage.setItem('quartierfest.token', fakeToken({ sub: '1', rolle: 'ORGANISATOR' }));
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(true);
  });

  it('roleGuard lässt die passende Rolle durch', () => {
    sessionStorage.setItem('quartierfest.token', fakeToken({ sub: '42', rolle: 'PARTEI' }));
    const result = TestBed.runInInjectionContext(() => roleGuard('PARTEI')(route, state));
    expect(result).toBe(true);
  });

  it('roleGuard leitet die falsche Rolle auf ihre Startseite um', () => {
    sessionStorage.setItem('quartierfest.token', fakeToken({ sub: '42', rolle: 'PARTEI' }));
    const result = TestBed.runInInjectionContext(() => roleGuard('ORGANISATOR')(route, state));
    expect(result).toBeInstanceOf(UrlTree);
    expect(result!.toString()).toBe('/meine-teilnahme');
  });
});

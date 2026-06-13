import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

function fakeToken(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signatur`;
}

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('zeigt ohne Anmeldung keine Navigation (UC-014)', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-nav__brand')?.textContent).toContain('Quartierfest');
    expect(compiled.querySelectorAll('.app-nav__link').length).toBe(0);
    expect(compiled.querySelector('.nav-benutzer')).toBeNull();
  });

  it('zeigt für ORGANISATOR die volle Navigation mit Abmelden (UC-014)', async () => {
    sessionStorage.setItem(
      'quartierfest.token',
      fakeToken({ sub: '1', email: 'orga@quartier.ch', rolle: 'ORGANISATOR' }),
    );
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.app-nav__link').length).toBeGreaterThan(4);
    expect(compiled.querySelector('.nav-benutzer__logout')?.textContent).toContain('Abmelden');
  });

  it('zeigt für PARTEI nur «Meine Teilnahme» (UC-014)', async () => {
    sessionStorage.setItem(
      'quartierfest.token',
      fakeToken({ sub: '42', email: 'mueller@quartier.ch', rolle: 'PARTEI' }),
    );
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.app-nav__link');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('Meine Teilnahme');
  });
});

import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type Rolle = 'ORGANISATOR' | 'PARTEI';

export interface LoginResponse {
  token: string;
}

const TOKEN_KEY = 'quartierfest.token';

/**
 * UC-014: Eigenbau-Login. Das Token liegt in sessionStorage (übersteht Reload,
 * weg beim Schliessen des Tabs); Rolle und E-Mail werden aus dem JWT-Payload gelesen.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;

  private readonly tokenSignal = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));

  readonly istAngemeldet = computed(() => this.tokenSignal() !== null);

  readonly rolle = computed<Rolle | null>(() => {
    const payload = dekodierePayload(this.tokenSignal());
    return (payload?.['rolle'] as Rolle | undefined) ?? null;
  });

  readonly email = computed<string | null>(() => {
    const payload = dekodierePayload(this.tokenSignal());
    return (payload?.['email'] as string | undefined) ?? null;
  });

  token(): string | null {
    return this.tokenSignal();
  }

  login(email: string, passwort: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, passwort }).pipe(
      tap((res) => {
        sessionStorage.setItem(TOKEN_KEY, res.token);
        this.tokenSignal.set(res.token);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
    this.router.navigate(['/login']);
  }

  /** Rollenbasierte Einstiegsseite nach Login (UC-014 Schritt 7). */
  startSeite(): string {
    return this.rolle() === 'PARTEI' ? '/meine-teilnahme' : '/personen';
  }
}

function dekodierePayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

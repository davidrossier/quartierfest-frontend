import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Benutzer, BenutzerPayload } from './benutzer.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BenutzerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/benutzer`;

  getAll(): Observable<Benutzer[]> {
    return this.http.get<Benutzer[]>(this.baseUrl);
  }

  create(payload: BenutzerPayload): Observable<Benutzer> {
    return this.http.post<Benutzer>(this.baseUrl, payload);
  }

  /** UC-015: Passwort-Reset durch den Organisator. */
  passwortSetzen(id: number, passwort: string): Observable<Benutzer> {
    return this.http.put<Benutzer>(`${this.baseUrl}/${id}/passwort`, { passwort });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Einladung, EinladungPayload, EinladungUpdatePayload } from './einladung.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EinladungService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/einladungen`;

  getAll(): Observable<Einladung[]> {
    return this.http.get<Einladung[]>(this.baseUrl);
  }

  save(payload: EinladungPayload): Observable<Einladung> {
    return this.http.post<Einladung>(this.baseUrl, payload);
  }

  /** UC-004/UC-006: Rückmeldung erfassen, Bestätigung markieren (REST-003) — Event und Partei bleiben fix. */
  update(id: number, payload: EinladungUpdatePayload): Observable<Einladung> {
    return this.http.put<Einladung>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

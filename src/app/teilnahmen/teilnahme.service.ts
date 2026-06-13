import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teilnahme, TeilnahmePayload, TeilnahmeUpdatePayload } from './teilnahme.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeilnahmeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/teilnahmen`;

  getAll(): Observable<Teilnahme[]> {
    return this.http.get<Teilnahme[]>(this.baseUrl);
  }

  /** UC-016: Teilnahme der eigenen Partei für den nächsten Event (Rolle PARTEI). */
  getMeine(): Observable<Teilnahme> {
    return this.http.get<Teilnahme>(`${this.baseUrl}/meine`);
  }

  save(payload: TeilnahmePayload): Observable<Teilnahme> {
    return this.http.post<Teilnahme>(this.baseUrl, payload);
  }

  /** UC-016: Whitelist-Update — nur die vier PARTEI-editierbaren Felder. */
  update(id: number, payload: TeilnahmeUpdatePayload): Observable<Teilnahme> {
    return this.http.put<Teilnahme>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

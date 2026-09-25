import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Abrechnung, AbrechnungPayload, AbrechnungUpdatePayload } from './abrechnung.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AbrechnungService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/abrechnungen`;

  getAll(): Observable<Abrechnung[]> {
    return this.http.get<Abrechnung[]>(this.baseUrl);
  }

  save(payload: AbrechnungPayload): Observable<Abrechnung> {
    return this.http.post<Abrechnung>(this.baseUrl, payload);
  }

  /** UC-011/UC-012: Kanal, Zustelldatum und Beträge ändern (REST-003) — die Teilnahme bleibt fix. */
  update(id: number, payload: AbrechnungUpdatePayload): Observable<Abrechnung> {
    return this.http.put<Abrechnung>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

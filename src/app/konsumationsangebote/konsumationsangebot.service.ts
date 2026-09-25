import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Konsumationsangebot, KonsumationsangebotPayload } from './konsumationsangebot.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KonsumationsangebotService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/konsumationsangebote`;

  getAll(): Observable<Konsumationsangebot[]> {
    return this.http.get<Konsumationsangebot[]>(this.baseUrl);
  }

  save(payload: KonsumationsangebotPayload): Observable<Konsumationsangebot> {
    return this.http.post<Konsumationsangebot>(this.baseUrl, payload);
  }

  /** UC-008: Angebot bearbeiten (REST-003, erweitert). */
  update(id: number, payload: KonsumationsangebotPayload): Observable<Konsumationsangebot> {
    return this.http.put<Konsumationsangebot>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Konsumation, KonsumationPayload, KonsumationUpdatePayload } from './konsumation.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KonsumationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/konsumationen`;

  getAll(): Observable<Konsumation[]> {
    return this.http.get<Konsumation[]>(this.baseUrl);
  }

  save(payload: KonsumationPayload): Observable<Konsumation> {
    return this.http.post<Konsumation>(this.baseUrl, payload);
  }

  /** UC-010: Anzahl einer bestehenden Matrix-Zelle ändern (REST-003, erweitert). */
  update(id: number, payload: KonsumationUpdatePayload): Observable<Konsumation> {
    return this.http.put<Konsumation>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teilnahme, TeilnahmePayload } from './teilnahme.model';

@Injectable({ providedIn: 'root' })
export class TeilnahmeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/teilnahmen';

  getAll(): Observable<Teilnahme[]> {
    return this.http.get<Teilnahme[]>(this.baseUrl);
  }

  save(payload: TeilnahmePayload): Observable<Teilnahme> {
    return this.http.post<Teilnahme>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

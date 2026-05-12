import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teilnahme, TeilnahmePayload } from './teilnahme.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeilnahmeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/teilnahmen`;

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

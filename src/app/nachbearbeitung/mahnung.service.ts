import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mahnung, MahnungPayload } from './mahnung.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MahnungService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/mahnungen`;

  getAll(): Observable<Mahnung[]> {
    return this.http.get<Mahnung[]>(this.baseUrl);
  }

  save(payload: MahnungPayload): Observable<Mahnung> {
    return this.http.post<Mahnung>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Einladung, EinladungPayload } from './einladung.model';

@Injectable({ providedIn: 'root' })
export class EinladungService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/einladungen';

  getAll(): Observable<Einladung[]> {
    return this.http.get<Einladung[]>(this.baseUrl);
  }

  save(payload: EinladungPayload): Observable<Einladung> {
    return this.http.post<Einladung>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

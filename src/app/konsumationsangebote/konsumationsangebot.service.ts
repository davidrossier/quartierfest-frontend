import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Konsumationsangebot, KonsumationsangebotPayload } from './konsumationsangebot.model';

@Injectable({ providedIn: 'root' })
export class KonsumationsangebotService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/konsumationsangebote';

  getAll(): Observable<Konsumationsangebot[]> {
    return this.http.get<Konsumationsangebot[]>(this.baseUrl);
  }

  save(payload: KonsumationsangebotPayload): Observable<Konsumationsangebot> {
    return this.http.post<Konsumationsangebot>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

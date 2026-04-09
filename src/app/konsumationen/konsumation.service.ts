import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Konsumation, KonsumationPayload } from './konsumation.model';

@Injectable({ providedIn: 'root' })
export class KonsumationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/konsumationen';

  getAll(): Observable<Konsumation[]> {
    return this.http.get<Konsumation[]>(this.baseUrl);
  }

  save(payload: KonsumationPayload): Observable<Konsumation> {
    return this.http.post<Konsumation>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

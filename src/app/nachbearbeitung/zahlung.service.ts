import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zahlung, ZahlungPayload } from './zahlung.model';

@Injectable({ providedIn: 'root' })
export class ZahlungService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/zahlungen';

  getAll(): Observable<Zahlung[]> {
    return this.http.get<Zahlung[]>(this.baseUrl);
  }

  save(payload: ZahlungPayload): Observable<Zahlung> {
    return this.http.post<Zahlung>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Abrechnung, AbrechnungPayload } from './abrechnung.model';
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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

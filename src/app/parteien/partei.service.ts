import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partei, ParteiPayload } from './partei.model';

@Injectable({ providedIn: 'root' })
export class ParteiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/parteien';

  getAll(): Observable<Partei[]> {
    return this.http.get<Partei[]>(this.baseUrl);
  }

  create(payload: ParteiPayload): Observable<Partei> {
    return this.http.post<Partei>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

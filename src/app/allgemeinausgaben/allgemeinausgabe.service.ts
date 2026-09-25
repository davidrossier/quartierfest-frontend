import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allgemeinausgabe, AllgemeinausgabePayload } from './allgemeinausgabe.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AllgemeinausgabeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/allgemeinausgaben`;

  getAll(): Observable<Allgemeinausgabe[]> {
    return this.http.get<Allgemeinausgabe[]>(this.baseUrl);
  }

  save(payload: AllgemeinausgabePayload): Observable<Allgemeinausgabe> {
    return this.http.post<Allgemeinausgabe>(this.baseUrl, payload);
  }

  /** UC-007: Ausgabe bearbeiten (REST-003, erweitert). */
  update(id: number, payload: AllgemeinausgabePayload): Observable<Allgemeinausgabe> {
    return this.http.put<Allgemeinausgabe>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

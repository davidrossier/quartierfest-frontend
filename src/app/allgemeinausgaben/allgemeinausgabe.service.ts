import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allgemeinausgabe, AllgemeinausgabePayload } from './allgemeinausgabe.model';

@Injectable({ providedIn: 'root' })
export class AllgemeinausgabeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/allgemeinausgaben';

  getAll(): Observable<Allgemeinausgabe[]> {
    return this.http.get<Allgemeinausgabe[]>(this.baseUrl);
  }

  save(payload: AllgemeinausgabePayload): Observable<Allgemeinausgabe> {
    return this.http.post<Allgemeinausgabe>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

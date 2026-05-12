import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person, PersonPayload } from './person.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/persons`;

  getAll(): Observable<Person[]> {
    return this.http.get<Person[]>(this.baseUrl);
  }

  create(payload: PersonPayload): Observable<Person> {
    return this.http.post<Person>(this.baseUrl, payload);
  }

  update(id: number, payload: PersonPayload): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Offre } from '../models/offre';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OffreService {
 private apiUrl = 'http://localhost:8085/api/offres';

  constructor(private http: HttpClient) {}

  create(offre: Offre): Observable<Offre> {
    console.log('Creating offre:', offre);
    return this.http.post<Offre>(this.apiUrl, offre ,{ withCredentials: true });
  }

  getAll(): Observable<Offre[]> {
    return this.http.get<Offre[]>(this.apiUrl);
  }

  getById(id: number): Observable<Offre> {
    return this.http.get<Offre>(`${this.apiUrl}/${id}`);
  }

  update(id: number, order: Offre): Observable<Offre> {
    return this.http.put<Offre>(`${this.apiUrl}/${id}`, order ,{ withCredentials: true });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}` ,{ withCredentials: true });
  }
}
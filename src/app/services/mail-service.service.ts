import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface ConstructionRequest {
  name: string;
  phone: string;
  email?: string;
  shape: string;
  surface: number | null;
  depth: string;
  volume?: number | null;
  estimatedPrice?: string;
}

export interface MaintenanceRequest {
  name: string;
  phone: string;
  email?: string;
  selectedOffer: string;
}


@Injectable({
  providedIn: 'root'
})
export class MailServiceService {

  private readonly API_URL = 'http://localhost:8085/api/contact'; // ← adjust port if needed

  constructor(private http: HttpClient) {}

  sendConstructionRequest(data: ConstructionRequest): Observable<string> {
    return this.http.post(`${this.API_URL}/construction`, data, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  sendMaintenanceRequest(data: MaintenanceRequest): Observable<string> {
    return this.http.post(`${this.API_URL}/maintenance`, data, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
    if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.status === 400) {
      errorMessage = 'Données invalides. Vérifiez le formulaire.';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    return throwError(() => new Error(errorMessage));
  }
}

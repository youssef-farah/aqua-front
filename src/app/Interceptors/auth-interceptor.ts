import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Don't add token to auth endpoints
    if (request.url.includes('/api/auth/register') || 
        request.url.includes('/api/auth/authenticate') ||
        request.url.includes('/api/auth/refresh-token')) {
      console.log('🔓 Public endpoint, no token needed:', request.url);
      return next.handle(request);
    }

    // Get token
    const token = this.authService.getAccessToken();
    
    console.log('🔍 Interceptor - Token exists:', !!token);
    console.log('🔍 Interceptor - Request URL:', request.url);
    console.log('🔍 Interceptor - Request Method:', request.method);
    
    if (token) {
      console.log('🔑 Adding token to request:', token.substring(0, 20) + '...');
      
      // Clone request and add Authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Authorization header added');
    } else {
      console.warn('⚠️ No token available for authenticated request');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ HTTP Error:', error.status, error.statusText);
        
        if (error.status === 401 || error.status === 403) {
          console.error('🚫 Authentication/Authorization failed');
          // Token expired or invalid
          this.authService.logoutClientSide();
          this.router.navigate(['/compte']);
        }
        return throwError(() => error);
      })
    );
  }
}
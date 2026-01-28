import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user';
import { Adresse } from '../models/adresse';

interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
}

interface UserData {
  access_token: string;
  refresh_token: string;
  role?: string;
  email?: string;
  userId?: number | null;
  fullUser?: User;   // 👉 Add full user here
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8085/api/auth';
    private apiUrl2 = 'http://localhost:8085/api/users';

  private loggedIn = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Check if user is logged in on service initialization (only in browser)
    if (this.isBrowser) {
      const userData = this.getUserFromStorage();
      if (userData && userData.access_token) {
        this.loggedIn.next(true);
        this.currentUserSubject.next(userData);
      }
    }
  }

  /**
   * Register a new user
   */
  signup(userData: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    telephone: string;
    adresse: Adresse;
  }): Observable<AuthenticationResponse> {
    // Map frontend fields to backend fields
    const registerRequest = {
      firstname: userData.prenom,
      lastname: userData.nom,
      email: userData.email,
      password: userData.password,
      telephone: userData.telephone,
      role: 'CUSTOMER',
      adresse: userData.adresse // Default role
    };

    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/register`, registerRequest).pipe(
      tap((response: AuthenticationResponse) => {
        if (response && response.access_token) {
          this.handleAuthenticationSuccess(response, userData.email);
        }
      })
    );
  }

  /**
   * Login user
   */
  login(credentials: { email: string; password: string }): Observable<AuthenticationResponse> {
    const authRequest = {
      email: credentials.email,
      password: credentials.password
    };

    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/authenticate`, authRequest).pipe(
      tap((response: AuthenticationResponse) => {
        if (response && response.access_token) {
          this.handleAuthenticationSuccess(response, credentials.email);
        }
      })
    );
  }


  private extractUserId(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}


  /**
   * Logout user - calls backend logout endpoint
   */
  logout(): Observable<any> {
    const token = this.getAccessToken();
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  /**
   * Logout without calling backend (for client-side only logout)
   */
  logoutClientSide(): void {
    this.clearAuthData();
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    if (this.isBrowser) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
    this.loggedIn.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/compte']);
  }

  /**
   * Handle successful authentication
   */
private handleAuthenticationSuccess(response: AuthenticationResponse, email: string): void {
  const role = this.extractRoleFromToken(response.access_token);
  const userId = this.extractUserId(response.access_token);

  const userData: UserData = {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    role,
    email,
    userId
  };

  // Store temporary tokens
  localStorage.setItem('user', JSON.stringify(userData));
  this.currentUserSubject.next(userData);

  // NEW: Fetch full user from backend
  if (userId) {
    this.http.get<User>(`${this.apiUrl2}/${userId}`).subscribe(fullUser => {
      userData.fullUser = fullUser;

      // overwrite with full user
      localStorage.setItem('user', JSON.stringify(userData));
      this.currentUserSubject.next(userData);
    });
  }

  this.loggedIn.next(true);
}




getFullUser(): User | null {
  console.log('Getting full user:', this.currentUserSubject.value?.fullUser);
  return this.currentUserSubject.value?.fullUser || null;
}


  /**
   * Extract role from JWT token
   */
private extractRoleFromToken(token: string): string {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    console.log('🔍 Decoded JWT payload:', decodedPayload); // Debug log
    
    // Backend stores roles in "roles" claim as a List
    const roles = decodedPayload.roles;
    
    console.log('🔐 Extracted roles from JWT:', roles); // Debug log
    
    // Check if roles exist and is an array
    if (Array.isArray(roles) && roles.length > 0) {
      // Get the first role (usually users have one role)
      let firstRole = String(roles[0]);
      
      // Remove "ROLE_" prefix if present (Spring Security adds this)
      const cleanedRole = firstRole.replace(/^ROLE_/i, '').trim().toUpperCase();
      
      console.log('✅ Final extracted role:', cleanedRole); // Debug log
      
      return cleanedRole;
    }
    
    // Fallback to CUSTOMER if no roles found
    console.log('⚠️ No roles found in JWT, defaulting to CUSTOMER');
    return 'CUSTOMER';
    
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return 'CUSTOMER';
  }
}

  /**
   * Get user data from storage
   */
  private getUserFromStorage(): UserData | null {
    if (!this.isBrowser) {
      return null;
    }

    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  /**
   * Get logged in status as observable
   */
  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  /**
   * Get current user data
   */
  getCurrentUser(): UserData | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user as observable
   */
  getCurrentUser$(): Observable<UserData | null> {
    return this.currentUserSubject.asObservable();
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    const user = this.getCurrentUser();
    return user ? user.access_token : null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    const user = this.getCurrentUser();
    return user ? user.refresh_token : null;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role || 'CUSTOMER' : null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    
    if (!userRole) {
      return false;
    }
    
    // Normalize both roles for comparison (remove ROLE_ prefix if present)
    const normalizedUserRole = userRole.replace(/^ROLE_/i, '').trim().toUpperCase();
    const normalizedCheckRole = role.replace(/^ROLE_/i, '').trim().toUpperCase();
    
    return normalizedUserRole === normalizedCheckRole;
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthenticationResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });

    return this.http.post<AuthenticationResponse>(
      `${this.apiUrl}/refresh-token`, 
      {},
      { headers }
    ).pipe(
      tap((response: AuthenticationResponse) => {
        if (response && response.access_token) {
          const currentUser = this.getCurrentUser();
          if (currentUser && this.isBrowser) {
            currentUser.access_token = response.access_token;
            currentUser.refresh_token = response.refresh_token;
            localStorage.setItem('user', JSON.stringify(currentUser));
            this.currentUserSubject.next(currentUser);
          }
        }
      })
    );
  }


forgotPassword(email: string): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/forgot-password`,
    null,
    {
      params: { email },responseType: 'text'
    }
  );
}

/**
 * Reset password using token
 */
resetPassword(token: string, newPassword: string): Observable<string> {
  return this.http.post(
    `${this.apiUrl}/reset-password`,
    null,
    {
      params: {
        token,
        newPassword
      },responseType: 'text'
    }
  );
}



loginWithGoogle(googleIdToken: string): Observable<AuthenticationResponse> {
  return this.http.post<AuthenticationResponse>(`${this.apiUrl}/google`, {
    token: googleIdToken
  }).pipe(
    tap((response: AuthenticationResponse) => {
      if (response && response.access_token) {
        // Extract email from Google token (optional, for display)
        const email = this.extractEmailFromGoogleToken(googleIdToken);
        this.handleAuthenticationSuccess(response, email || 'google-user@example.com');
      }
    })
  );
}

/**
 * Extract email from Google ID token (client-side decode)
 */
private extractEmailFromGoogleToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private apiUrl = 'http://localhost:8085/api/users';
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // if token exists, user is logged in
    this.loggedIn.next(!!localStorage.getItem('user'));
  }

  // Signup (Register)
  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  // Login
  login(credentials: { mail: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: any) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.loggedIn.next(true);
        }
      })
    );
  }

  // Logout
  logout(): void {
    localStorage.removeItem('user');
    this.loggedIn.next(false);
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  // Get user info
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

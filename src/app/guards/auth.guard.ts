import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

 
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/compte']);
      return false;
    }

    // Check if user has ADMIN role
    const userRole = this.authService.getUserRole();
    
    if (userRole?.toUpperCase() === 'ADMIN') {
      return true;
    } else {
      // Not an admin, redirect to home page
      console.warn('Access denied. Admin role required.');
      this.router.navigate(['/']);
      return false;
    }
  }
}
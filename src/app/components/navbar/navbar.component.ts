import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private authService: AuthService) {

  }
  navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/boutique', label: 'Boutique' },
    { to: '/services', label: 'Services' },
    { to: '/contact', label: 'Contact' },
    { to: '/apropos', label: 'À Propos' },
   
  ];

  totalItems = 0;



logout(): void {
  this.authService.logout().subscribe({
    next: () => {
      // Successfully logged out
    },
    error: (error) => {
      console.error('Logout error:', error);
      // Even if backend logout fails, clear client-side data
      this.authService.logoutClientSide();
    }
  });
}






}

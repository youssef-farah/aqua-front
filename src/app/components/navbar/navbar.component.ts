import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  constructor(private authService: AuthService) {
  

  }
  navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/boutique', label: 'Boutique' },
    { to: '/services', label: 'Services' },
    { to: '/contact', label: 'Contact' },
    { to: '/offresboutique', label: 'Offres' },
        { to: '/dosage', label: 'Dosage' },

   
  ];

  totalItems = 0;


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

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

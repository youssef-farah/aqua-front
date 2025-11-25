import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/boutique', label: 'Boutique' },
    { to: '/partenaire', label: 'Services' },
    { to: '/contact', label: 'Contact' },
    { to: '/apropos', label: 'À Propos' },
   
  ];

  totalItems = 0;
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  year = new Date().getFullYear(); 
  footerLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/boutique', label: 'Boutique' },
    { to: '/partenaire', label: 'Partenaire' },
    { to: '/contact', label: 'Contact' },
    { to: '/apropos', label: 'À Propos' }
  ];





  newsletterEmail: string = '';

  onNewsletterSubmit(): void {
    if (this.newsletterEmail) {
      console.log('Newsletter subscription:', this.newsletterEmail);
      // Add toast notification or success message here
      this.newsletterEmail = '';
    }
  }

}

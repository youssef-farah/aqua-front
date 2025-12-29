import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  private observer!: IntersectionObserver;
  private hasAnimated = false;

  heroImages = [
    'raphael-biscaldi-7RQf2X6aXXI-unsplash.jpg?w=1000&h=500&fit=crop',
    'pexels-marctutorials-298692-870170.jpg?w=1000&h=500&fit=crop',
        'sidi.jpg?w=1000&h=500&fit=crop',

  ];

  services = [
    { icon: 'fa-droplet', title: 'Piscines de Qualité', description: 'Construction et installation de piscines personnalisées' },
    { icon: 'fa-shield-alt', title: 'Garantie Excellence', description: 'Produits garantis et service après-vente de qualité' },
    { icon: 'fa-bolt', title: 'Innovation', description: 'Technologies modernes pour votre confort aquatique' }
  ];

  testimonials = [
    { name: 'Ahmed Ben Ali', text: 'Service impeccable et produits de haute qualité. Notre piscine est magnifique!', rating: 5 },
    { name: 'Fatma Gharbi', text: "Équipe professionnelle et à l'écoute. Je recommande vivement!", rating: 5 },
    { name: 'Mohamed Trabelsi', text: 'Excellent rapport qualité-prix. Très satisfait de mon achat.', rating: 5 }
  ];

  partners = [
    'RainBirdSANSF.png',  
    'xakaSANSF.png',
    'ASPOOL..png',
    'ElectroSANSF.png'
  ];

  statsData = [
    { label: 'N° Prix', target: 1, current: 0, suffix: '' },
    { label: 'Ans d\'expérience', target: 27, current: 0, suffix: '' },
    { label: 'Produits', target: 3056, current: 0, suffix: '' },
    { label: 'Clients', target: 3000, current: 0, suffix: '+' }
  ];


  navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/boutique', label: 'Boutique' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
  { to: '/apropos', label: 'À Propos' },
];

totalItems = 0;

  currentImage = 0;
  currentTestimonial = 0;
  heroInterval: any;
  testimonialInterval: any;
  private statsIntervals: any[] = [];

  @ViewChild('statsSection') statsSection!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Only run slideshow on the client (browser)
    if (isPlatformBrowser(this.platformId)) {
      this.heroInterval = setInterval(() => {
        this.currentImage = (this.currentImage + 1) % this.heroImages.length;
      }, 5000);

      this.testimonialInterval = setInterval(() => {
        this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
      }, 3000);
    }
  }

  ngAfterViewInit(): void {
    // Only create IntersectionObserver if running in browser
    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            this.startStatsAnimation();
            this.observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      if (this.statsSection && this.statsSection.nativeElement) {
        this.observer.observe(this.statsSection.nativeElement);
      }
    }
  }

  private startStatsAnimation() {
    const duration = 1000;
    const fps = 60;
    const totalFrames = (duration / 1000) * fps;

    this.statsData.forEach((stat, idx) => {
      let frame = 0;

      const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutQuad = 1 - Math.pow(1 - progress, 3);

        stat.current = Math.floor(easeOutQuad * stat.target);

        if (frame >= totalFrames) {
          stat.current = stat.target;
          clearInterval(interval);
        }
      }, 1000 / fps);

      this.statsIntervals.push(interval);
    });
  }

  ngOnDestroy(): void {
    if (this.heroInterval) clearInterval(this.heroInterval);
    if (this.testimonialInterval) clearInterval(this.testimonialInterval);
    this.statsIntervals.forEach(i => clearInterval(i));

    if (this.observer) this.observer.disconnect();
  }




    newsletterEmail: string = '';

  onNewsletterSubmit(): void {
    if (this.newsletterEmail) {
      console.log('Newsletter subscription:', this.newsletterEmail);
      // Add toast notification or success message here
      this.newsletterEmail = '';
    }
  }

}

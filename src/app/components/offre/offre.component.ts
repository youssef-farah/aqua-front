import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { OffreService } from '../../services/offre.service';
import { Offre } from '../../models/offre';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offre',
  templateUrl: './offre.component.html',
  styleUrl: './offre.component.css'
})
export class OffreComponent implements OnInit, OnDestroy {
 offres: Offre[] = [];
  currentIndex: number = 0;
  isVisible: boolean = false;
  slideInterval: any;
  slideDelay: number = 5000;

  constructor(
    private offreService: OffreService,
    @Inject(PLATFORM_ID) private platformId: Object,private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOffres();

    if (isPlatformBrowser(this.platformId)) {
      this.showPopupAfterDelay(); // only run in browser
    }
  }

  loadOffres(): void {
    this.offreService.getAll().subscribe({
      next: (data) => this.offres = data,

      error: (err) => console.error(err),
    });

    console.log(this.offres);
  }

  showPopupAfterDelay(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      this.isVisible = true;
      this.startSlideshow();
    }, 2000);
  }

  startSlideshow(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.slideDelay);
  }

  nextSlide(): void {
    if (this.offres.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.offres.length;
    }
  }

  previousSlide(): void {
    if (this.offres.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.offres.length) % this.offres.length;
    }
  }

  closePopup(): void {
    this.isVisible = false;
    this.stopSlideshow();
  }

  stopSlideshow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.stopSlideshow();
    this.startSlideshow();
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }




  goToBoutique() {
  this.router.navigate(['/boutique']);
}

}

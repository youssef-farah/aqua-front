import { Component, OnInit, OnDestroy } from '@angular/core';
import { Offre } from '../../models/offre';
import { Product } from '../../models/product';
import { OffreService } from '../../services/offre.service';
import { ProductServiceService } from '../../services/product-service.service';

@Component({
  selector: 'app-offresboutique',
  templateUrl: './offresboutique.component.html',
  styleUrl: './offresboutique.component.css'
})
export class OffresboutiqueComponent implements OnInit, OnDestroy {

  offres: Offre[] = [];
  hotProducts: Product[] = [];

  loading = true;
  currentOfferIndex = 0;

  private offerRotationInterval!: number;

  constructor(
    private offreService: OffreService,
    private productService: ProductServiceService
  ) {}

  ngOnInit(): void {
    this.loadOffres();
    this.loadHotProducts();
    this.startOfferRotation();
  }

  ngOnDestroy(): void {
    if (this.offerRotationInterval) {
      clearInterval(this.offerRotationInterval);
    }
  }

  // ========================
  // OFFRES
  // ========================
  loadOffres(): void {
    this.offreService.getAll().subscribe({
      next: (data) => {
        this.offres = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading offers:', err);
        this.loading = false;
      }
    });
  }

  // ========================
  // HOT PRODUCTS
  // ========================
  loadHotProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        // Randomize order ONCE and keep it stable
        this.hotProducts = [...data]
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }

  // ========================
  // OFFER ROTATION
  // ========================
  startOfferRotation(): void {
    this.offerRotationInterval = window.setInterval(() => {
      if (this.offres.length > 0) {
        this.currentOfferIndex =
          (this.currentOfferIndex + 1) % this.offres.length;
      }
    }, 4000);
  }
}

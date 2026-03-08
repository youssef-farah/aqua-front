import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ProductServiceService } from '../../services/product-service.service';
import { Product } from '../../models/product';
import { productoption } from '../../models/product-option';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  productAdded = false;
  showbtn = false;
  similarProducts: Product[] = [];
  
  // New properties for options
  selectedOption: productoption | null = null;
  displayPrice: number = 0;
  
  constructor(
    private cartService: CartService,
    private route: ActivatedRoute,
    private prodser: ProductServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProductDetails(productId);
      this.loadSimilarProducts();
    });
  }

  loadProductDetails(productId: number): void {
    this.prodser.getProductByCode(productId).subscribe({
      next: (data) => {
        console.log('Product data received:', data);
        this.product = {
          code: productId,
          titre: data.titre || 'Casque Audio Sans Fil',
          image: data.image || 'assets/images/casque-audio.jpg',
          prix: data.prix,
          description: data.description || 'Profitez d\'une expérience audio exceptionnelle avec ce casque sans fil offrant un son cristallin et un confort optimal.',
          stock: data.stock,
          lieuDeProduction: data.lieuDeProduction,
          options: data.options || []
        };
        
        console.log('Product options:', this.product.options);
        
        // Initialize display price with base price
        this.displayPrice = this.product.prix || 0;
        
        // If there are options, select the first one by default
        if (this.product.options && this.product.options.length > 0) {
          this.selectedOption = this.product.options[0];
          this.updateDisplayPrice();
          console.log('Default selected option:', this.selectedOption);
        }
      },
      error: (err) => {
        console.error('Error loading product:', err);
      }
    });
  }

  loadSimilarProducts(): void {
    this.prodser.getAllProducts().subscribe({
      next: (products) => {
        // Filter out current product and limit to 4 items
        this.similarProducts = products
          .filter(p => p.code !== this.product?.code)
          .slice(0, 4);
      },
      error: (err) => console.error('Error loading similar products:', err)
    });
  }

  // Handle option selection change
  onOptionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedId = Number(selectElement.value);
    
    if (this.product?.options) {
      this.selectedOption = this.product.options.find(opt => opt.id === selectedId) || null;
      this.updateDisplayPrice();
      console.log('Selected option:', this.selectedOption);
    }
  }

  // Update the display price based on selected option
  updateDisplayPrice(): void {
    if (this.selectedOption && this.selectedOption.optionPrice !== undefined) {
      this.displayPrice = this.selectedOption.optionPrice;
    } else if (this.product?.prix) {
      this.displayPrice = this.product.prix;
    }
  }

  onAddToCart(): void {
    if (this.product) {
      // Create a modified product object with the selected option info
      const productToAdd = {
        ...this.product,
        prix: this.displayPrice,
        selectedOption: this.selectedOption
      };
      
      this.cartService.addToCart(productToAdd, this.quantity);
      console.log("Added to cart with option:", this.selectedOption);
      this.quantity = 1;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  addToCart() {
    this.onAddToCart();
    this.productAdded = true;
    setTimeout(() => {
      this.productAdded = false;
    }, 1800);
    this.showbtn = true;
  }

  goToCart() {
    this.router.navigate(['/panier']);
  }

  gotoboutique() {
    this.router.navigate(['/boutique']);
  }

  viewProductDetails(productCode: number) {
    this.router.navigate(['/product', productCode]);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Helper method to check if product has options
  hasOptions(): boolean {
    return !!(this.product?.options && this.product.options.length > 0);
  }
}
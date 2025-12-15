import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ProductServiceService } from '../../services/product-service.service';
import { Product } from '../../models/product';
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
        console.log(data);
        this.product = {
          code: productId,
          titre: data.titre || 'Casque Audio Sans Fil',
          image: data.image || 'assets/images/casque-audio.jpg',
          prix: data.prix,
          description: data.description || 'Profitez d\'une expérience audio exceptionnelle avec ce casque sans fil offrant un son cristallin et un confort optimal.',
          stock: data.stock,
          lieuDeProduction: data.lieuDeProduction,
        };
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

  onAddToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      console.log("Added to cart!");
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
}
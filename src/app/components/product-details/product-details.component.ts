import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductServiceService } from '../../services/product-service.service';
import { CartComponent } from '../cart/cart.component';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
 // @ViewChild(CartComponent) cartComponent!: CartComponent;
  
  product: Product | null = null;
  quantity: number = 1;
productAdded = false;
showbtn = false;
  constructor(private cartService: CartService,private route: ActivatedRoute, private prodser: ProductServiceService, private router : Router ) {}

  ngOnInit(): void {
    // Get product ID from route params
    this.route.params.subscribe(params => {
      const productId = params['id'];
      // Fetch product details
      this.loadProductDetails(productId);
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
      lieuDeProduction: data.lieuDeProduction,};
      }
    });
  }

onAddToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      console.log("Added to cart !");
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
  this.onAddToCart(); // your existing method

  this.productAdded = true;

  setTimeout(() => {
    this.productAdded = false;
  }, 1800); 
  
  this.showbtn = true;// 1.8s fade out
}



goToCart() {
  this.router.navigate(['/panier']);  // Make sure Router is injected
}

gotoboutique() {
  this.router.navigate(['/boutique']);  // Make sure Router is injected   
}
}

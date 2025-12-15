import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CartItem, CartService } from '../../services/cart.service';
import { OrderServiceService } from '../../services/order-service.service';
import { OrderItemServiceService } from '../../services/order-item-service.service';
import { Order, OrderState } from '../../models/order';
import { OrderItem } from '../../models/order-item';
import { ProductServiceService } from '../../services/product-service.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { UserServiceService } from '../../services/user-service.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: CartItem[] = [];
  isCheckingOut: boolean = false;
  showLoginModal: boolean = false;
  showConfirmationModal: boolean = false;
  currentUser: any = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderServiceService,
    private orderItemService: OrderItemServiceService,
    private pr: ProductServiceService,
    private router: Router, 
    private authService: AuthService,private userService:UserServiceService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cart = items;
    });
    
    // Load current user if logged in
    if (this.isUserLoggedIn()) {
      this.currentUser = this.authService.getFullUser();
    }
  }

  removeItem(id: number): void {
    this.cartService.removeItem(id);
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeItem(productId);
  }

  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

onCheckout(): void {
  if (this.cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Check if user is logged in
  if (!this.isUserLoggedIn()) {
    this.showLoginModal = true;
    return;
  }

  // Get user ID from auth service
  const tempUser = this.authService.getFullUser();
  
  if (!tempUser || !tempUser.id_user) {
    console.error('User ID not found');
    this.showLoginModal = true;
    return;
  }

  // Load full user data from backend before showing confirmation modal
  this.userService.getUserById(tempUser.id_user).subscribe({
    next: (data) => {
      this.currentUser = data;
      console.log('Full user data loaded for checkout:', this.currentUser);
      this.showConfirmationModal = true;
    },
    error: (error) => {
      console.error('Error loading user data:', error);
      // Fallback to auth service data if API fails
      this.currentUser = tempUser;
      this.showConfirmationModal = true;
    }
  });
}

  confirmOrder(): void {
    this.showConfirmationModal = false;
    this.processCheckout();
  }

  processCheckout(): void {
    this.isCheckingOut = true;

    // Step 1: Create the Order
    const order = new Order(
      null,
      new Date(),
      new Date(),
      OrderState.CREATED,
      this.getTotalPrice(),
      this.authService.getFullUser()!
    );

    this.orderService.create(order).subscribe({
      next: (createdOrder: Order) => {
        // Step 2: Create OrderItems for each CartItem
        const orderItemCreates$ = this.cart.map(cartItem =>
          this.pr.getProductByCode(cartItem.id).pipe(
            mergeMap(product => {
              const orderItem = new OrderItem(
                null,
                createdOrder,
                product,
                cartItem.quantity,
                cartItem.price,
                cartItem.price * cartItem.quantity,
              );
              return this.orderItemService.create(orderItem);
            })
          )
        );
        
        // Step 3: Wait for all OrderItems to be created
        forkJoin(orderItemCreates$).subscribe({
          next: (results) => {
            console.log('All order items created:', results);
            alert('Order placed successfully!');
            
            // Clear the cart after successful checkout
             // Better to use service method
            this.cart = [];
            this.isCheckingOut = false;
          },
          error: (error) => {
            console.error('Error creating order items:', error);
            alert('Error placing order. Please try again.');
            this.isCheckingOut = false;
          }
        });
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('Error placing order. Please try again.');
        this.isCheckingOut = false;
      }
    });
  }

  // Navigate to login/compte page
  goToLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/compte']);
  }

  // Navigate to profile page from confirmation modal
  goToProfile(): void {
    this.showConfirmationModal = false;
    this.router.navigate(['/compte']);
  }

  // Close login modal
  closeModal(): void {
    this.showLoginModal = false;
  }

  // Close confirmation modal
  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
  }
}
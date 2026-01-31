import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { CartItem, CartService } from '../../services/cart.service';
import { OrderServiceService } from '../../services/order-service.service';
import { OrderItemServiceService } from '../../services/order-item-service.service';
import { ProductServiceService } from '../../services/product-service.service';
import { AuthService } from '../../services/auth.service';
import { UserServiceService } from '../../services/user-service.service';
import { PaymentService } from '../../services/payment.service';

import { Order, OrderState } from '../../models/order';
import { OrderItem } from '../../models/order-item';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cart: CartItem[] = [];

  isCheckingOut = false;
  showLoginModal = false;
  showConfirmationModal = false;

  currentUser: any = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderServiceService,
    private orderItemService: OrderItemServiceService,
    private productService: ProductServiceService,
    private authService: AuthService,
    private userService: UserServiceService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  // ================= INIT =================

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cart = items;
    });

    if (this.isUserLoggedIn()) {
      this.currentUser = this.authService.getFullUser();
    }
  }

  // ================= CART =================

  removeFromCart(productId: number): void {
    this.cartService.removeItem(productId);
  }

  getTotalPrice(): number {
    return this.cart.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }

  // ================= AUTH =================

  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // ================= CHECKOUT =================

  onCheckout(): void {

    if (this.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!this.isUserLoggedIn()) {
      this.showLoginModal = true;
      return;
    }

    const tempUser = this.authService.getFullUser();

    if (!tempUser || !tempUser.id_user) {
      console.error('User ID not found');
      this.showLoginModal = true;
      return;
    }

    // Load full user before confirmation
    this.userService.getUserById(tempUser.id_user).subscribe({
      next: (data) => {
        this.currentUser = data;
        this.showConfirmationModal = true;
      },
      error: () => {
        this.currentUser = tempUser;
        this.showConfirmationModal = true;
      }
    });
  }

  confirmOrder(): void {
    this.showConfirmationModal = false;
    this.processCheckoutWithPayment();
  }

  // ================= MAIN FLOW =================

  /**
   * Create Order → Create Items → Initiate Payment
   */
  processCheckoutWithPayment(): void {

    this.isCheckingOut = true;

    // 1️⃣ Create Order
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

        console.log('✅ Order created:', createdOrder);

        // 2️⃣ Create OrderItems
        const orderItems$ = this.cart.map(cartItem =>
          this.productService.getProductByCode(cartItem.id).pipe(
            mergeMap(product => {

              const orderItem = new OrderItem(
                null,
                createdOrder,
                product,
                cartItem.quantity,
                cartItem.price,
                cartItem.price * cartItem.quantity
              );

              return this.orderItemService.create(orderItem);
            })
          )
        );

        // 3️⃣ Wait for all items
        forkJoin(orderItems$).subscribe({

          next: () => {
            console.log('✅ All order items created');
            this.initiatePayment(createdOrder.id!);
          },

          error: (err) => {
            console.error('❌ OrderItems error:', err);
            alert('Error creating order items');
            this.isCheckingOut = false;
          }

        });

      },

      error: (err) => {
        console.error('❌ Order error:', err);
        alert('Error creating order');
        this.isCheckingOut = false;
      }

    });
  }

  // ================= PAYMENT =================

  /**
   * Call backend → redirect to Flouci
   */
  private initiatePayment(orderId: number): void {

    console.log('💳 Initiating payment for order:', orderId);

    this.paymentService.initiatePayment(orderId).subscribe({

      next: (response) => {

        if (response.success && response.paymentLink) {

          console.log('✅ Payment started');

          // Save for success page
          sessionStorage.setItem('pendingOrderId', orderId.toString());
          sessionStorage.setItem('pendingPaymentId', response.paymentId);

          // Clear cart (order is saved)
          //this.cartService.clearCart();
          this.cart = [];

          // Redirect to Flouci
          window.location.href = response.paymentLink;

        } else {
          throw new Error('Invalid payment response');
        }
      },

      error: (err) => {
        console.error('❌ Payment error:', err);

        alert(
          'Payment error. Please try again later.\nOrder ID: ' + orderId
        );

        this.isCheckingOut = false;
      }

    });
  }

  // ================= MODALS =================

  goToLogin(): void {
    this.closeModal();
    this.router.navigate(['/compte']);
  }

  goToProfile(): void {
    this.closeConfirmationModal();
    this.router.navigate(['/compte']);
  }

  closeModal(): void {
    this.showLoginModal = false;
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderCreationRequest, PaymentService } from '../../services/payment.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-succespay',
  templateUrl: './succespay.component.html',
  styleUrl: './succespay.component.css'
})
export class SuccespayComponent implements OnInit {

  isLoading = true;
  success = false;
  errorMessage = '';
  orderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Get payment_id from URL query params (Flouci redirects with ?payment_id=xxx)
    this.route.queryParams.subscribe(params => {
      const paymentId = params['payment_id'];

      if (!paymentId) {
        this.handleError('No payment ID found in URL');
        return;
      }

      this.verifyPaymentAndCreateOrder(paymentId);
    });
  }

  /**
   * Verify payment with backend and create order if successful
   */
  private verifyPaymentAndCreateOrder(paymentId: string): void {

    console.log('🔍 Verifying payment:', paymentId);

    // Get payment data from sessionStorage
    const paymentDataStr = sessionStorage.getItem('pendingPaymentData');

    if (!paymentDataStr) {
      this.handleError('Payment data not found. Please contact support.');
      return;
    }

    const paymentData = JSON.parse(paymentDataStr);

    // Build request for order creation
    const request: OrderCreationRequest = {
      paymentId: paymentId,
      userId: paymentData.userId,
      totalAmount: paymentData.totalAmount,
      cartItems: paymentData.cartItems
    };

    // Call backend to verify payment and create order
    this.paymentService.verifyAndCreateOrder(request).subscribe({

      next: (response) => {

        if (response.success) {

          console.log('✅ Payment verified and order created:', response.orderId);

          this.success = true;
          this.orderId = response.orderId;

          // CRITICAL: Clear cart only after successful order creation
          this.cartService.clearCart();
          console.log('🗑️ Cart cleared');

          // Clean up sessionStorage
          sessionStorage.removeItem('pendingPaymentData');

          this.isLoading = false;

        } else {
          this.handleError(response.error || 'Order creation failed');
        }
      },

      error: (err) => {
        console.error('❌ Payment verification error:', err);
        this.handleError('Payment verification failed. Please contact support with payment ID: ' + paymentId);
      }

    });
  }

  private handleError(message: string): void {
    this.isLoading = false;
    this.success = false;
    this.errorMessage = message;
  }

  goToOrders(): void {
    this.router.navigate(['/compte']);
  }

  goToHome(): void {
    this.router.navigate(['/boutique']);
  }

}

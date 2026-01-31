import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-failpay',
  templateUrl: './failpay.component.html',
  styleUrl: './failpay.component.css'
})
export class FailpayComponent {

 paymentId = '';
  orderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get payment ID from URL if available
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || '';
    });

    // Get order ID from session storage
    const storedOrderId = sessionStorage.getItem('pendingOrderId');
    if (storedOrderId) {
      this.orderId = parseInt(storedOrderId, 10);
    }
  }

  retryPayment(): void {
    // If we have an order ID, redirect back to cart/checkout
    if (this.orderId) {
      this.router.navigate(['/cart']);
      alert('Your order (#' + this.orderId + ') is still pending. Please try payment again.');
    } else {
      this.router.navigate(['/cart']);
    }
  }

  goToHome(): void {
    // Clear session storage
    sessionStorage.removeItem('pendingOrderId');
    sessionStorage.removeItem('pendingPaymentId');
    
    this.router.navigate(['/']);
  }

  contactSupport(): void {
    // Implement your support contact logic
    const message = `Payment Failed
Order ID: ${this.orderId || 'N/A'}
Payment ID: ${this.paymentId || 'N/A'}

Please contact support at: support@yourstore.com`;
    
    alert(message);
  }
}

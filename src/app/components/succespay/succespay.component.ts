import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-succespay',
  templateUrl: './succespay.component.html',
  styleUrl: './succespay.component.css'
})
export class SuccespayComponent implements OnInit {

 isVerifying = true;
  verificationSuccess = false;
  verificationError = false;
  errorMessage = '';
  orderId: number | null = null;
  orderState = '';
  paymentId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Get payment_id from URL query params (Flouci redirects with this)
    this.route.queryParams.subscribe(params => {
      const paymentIdFromUrl = params['payment_id'];
      
      if (paymentIdFromUrl) {
        this.paymentId = paymentIdFromUrl;
        this.verifyPayment(paymentIdFromUrl);
      } else {
        // Fallback: check session storage
        const storedPaymentId = sessionStorage.getItem('pendingPaymentId');
        if (storedPaymentId) {
          this.paymentId = storedPaymentId;
          this.verifyPayment(storedPaymentId);
        } else {
          this.showError('No payment ID found. Please contact support.');
        }
      }
    });
  }

  verifyPayment(paymentId: string): void {
    this.isVerifying = true;
    
    this.paymentService.verifyPayment(paymentId).subscribe({
      next: (response) => {
        console.log('✅ Payment verified:', response);
        
        if (response.success && response.orderState === 'CONFIRMED') {
          this.verificationSuccess = true;
          this.orderId = response.orderId;
          this.orderState = response.orderState;
          
          // Clear session storage
          sessionStorage.removeItem('pendingOrderId');  
          sessionStorage.removeItem('pendingPaymentId');
          
          // Optional: Auto-redirect after 5 seconds
          setTimeout(() => {
            this.goToOrders();
          }, 5000);
        } else {
          this.showError('Payment verification failed. Order state: ' + response.orderState);
        }
        
        this.isVerifying = false;
      },
      error: (error) => {
        console.error('❌ Payment verification error:', error);
        this.showError('Failed to verify payment. Please contact support.');
        this.isVerifying = false;
      }
    });
  }

  showError(message: string): void {
    this.verificationError = true;
    this.errorMessage = message;
    this.isVerifying = false;
  }

  goToOrders(): void {
    this.router.navigate(['/compte']);
  }

  goToHome(): void {
    this.router.navigate(['/boutique']);
  }

  contactSupport(): void {
    // Implement your support contact logic
    alert('Please contact support at: support@yourstore.com\nPayment ID: ' + this.paymentId);
  }
}

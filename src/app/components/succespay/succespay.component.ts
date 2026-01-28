import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-succespay',
  templateUrl: './succespay.component.html',
  styleUrl: './succespay.component.css'
})
export class SuccespayComponent implements OnInit {


  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private router: Router
  ) {}
  
  ngOnInit() {
    const paymentId = this.route.snapshot.queryParams['payment_id'];
    
    if (paymentId) {
      this.paymentService.verifyPayment(paymentId).subscribe(result => {
        if (result.success && result.orderState === 'CONFIRMED') {
console.log('Payment verified successfully for payment ID:', paymentId);
          this.router.navigate(['/orders', result.orderId]);
        } else {
          console.error('Payment verification failed or order not confirmed.');
          this.router.navigate(['/failpay']);
        }
      });
    }
  }



  goToBoutique(): void {
    this.router.navigate(['/boutique']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}

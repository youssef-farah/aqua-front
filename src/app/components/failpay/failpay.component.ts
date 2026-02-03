import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-failpay',
  templateUrl: './failpay.component.html',
  styleUrl: './failpay.component.css'
})
export class FailpayComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('❌ Payment failed - cart preserved');
    
    // Clean up pending payment data (but cart remains intact)
    sessionStorage.removeItem('pendingPaymentData');
  }

  /**
   * Go back to cart to try again
   * Cart items are still there
   */
  goToCart(): void {
    this.router.navigate(['/panier']);
  }

  goToHome(): void {
    this.router.navigate(['/boutique']);
  }

}

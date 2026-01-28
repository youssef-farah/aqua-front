import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-failpay',
  templateUrl: './failpay.component.html',
  styleUrl: './failpay.component.css'
})
export class FailpayComponent {


   constructor(private router: Router) {}

  retryPayment(): void {
    this.router.navigate(['/checkout']);
  }

  goToBoutique(): void {
    this.router.navigate(['/boutique']);
  }
}

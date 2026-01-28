import { Component } from '@angular/core';

@Component({
  selector: 'app-redirectpage',
  templateUrl: './redirectpage.component.html',
  styleUrl: './redirectpage.component.css'
})
export class RedirectpageComponent {

  handleResend(): void {
    console.log('Resend email clicked');
    // Add your resend logic here
  }

  handleReturnHome(): void {
    console.log('Return home clicked');
    // Add your navigation logic here
  }
}




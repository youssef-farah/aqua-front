import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {



   email: string = '';
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService) {}

  submit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.successMessage = 'Reset link sent to your email';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Something went wrong';
        this.loading = false;
      }
    });
  }
}

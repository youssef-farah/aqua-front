import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CartItem, CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { UserServiceService } from '../../services/user-service.service';
import { PaymentService, CartItemDTO, PaymentInitiateRequest } from '../../services/payment.service';

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
  showPersonalInfoForm = false;

  currentUser: any = null;
  personalInfoForm!: FormGroup;
  isUpdatingInfo = false;
  updateErrorMessage = '';
  updateSuccessMessage = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private userService: UserServiceService,
    private paymentService: PaymentService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  // ================= INIT =================

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cart = items;
    });

    if (this.isUserLoggedIn()) {
      this.currentUser = this.authService.getFullUser();
    }

    this.initPersonalInfoForm();
  }

  initPersonalInfoForm(): void {
    this.personalInfoForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: this.fb.group({
        country: ['', Validators.required],
        city: ['', Validators.required],
        street: ['', Validators.required],
        houseNumber: ['', Validators.required],
        postalCode: ['']
      })
    });
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

  // ================= PERSONAL INFO VALIDATION =================

  hasCompletePersonalInfo(user: any): boolean {
    if (!user) return false;

    const requiredFields = [
      user.nom,
      user.prenom,
      user.mail,
      user.telephone,
      user.adresse?.country,
      user.adresse?.city,
      user.adresse?.street,
      user.adresse?.houseNumber
    ];

    return requiredFields.every(field => field && field.toString().trim() !== '');
  }

  populateFormWithUserData(): void {
    if (this.currentUser) {
      this.personalInfoForm.patchValue({
        nom: this.currentUser.nom || '',
        prenom: this.currentUser.prenom || '',
        mail: this.currentUser.mail || '',
        telephone: this.currentUser.telephone || '',
        adresse: {
          country: this.currentUser.adresse?.country || '',
          city: this.currentUser.adresse?.city || '',
          street: this.currentUser.adresse?.street || '',
          houseNumber: this.currentUser.adresse?.housenumber || this.currentUser.adresse?.houseNumber || '',
          postalCode: this.currentUser.adresse?.postalCode || ''
        }
      });
    }
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
        this.checkUserInfoAndProceed();
      },
      error: () => {
        this.currentUser = tempUser;
        this.checkUserInfoAndProceed();
      }
    });
  }

  checkUserInfoAndProceed(): void {
    if (this.hasCompletePersonalInfo(this.currentUser)) {
      // User has complete info, show confirmation modal
      this.showConfirmationModal = true;
    } else {
      // User info incomplete, show personal info form
      this.populateFormWithUserData();
      this.showPersonalInfoForm = true;
    }
  }

  onUpdatePersonalInfo(): void {
    if (this.personalInfoForm.invalid) {
      this.markFormGroupTouched(this.personalInfoForm);
      this.updateErrorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isUpdatingInfo = true;
    this.updateErrorMessage = '';
    this.updateSuccessMessage = '';

    const userUpdate: any = {
      id_user: this.currentUser.id_user,
      mail: this.personalInfoForm.value.mail,
      password: this.currentUser.password,
      role: this.currentUser.role,
      nom: this.personalInfoForm.value.nom,
      prenom: this.personalInfoForm.value.prenom,
      telephone: this.personalInfoForm.value.telephone,
      adresse: {
        street: this.personalInfoForm.value.adresse.street || '',
        houseNumber: this.personalInfoForm.value.adresse.houseNumber || '',
        city: this.personalInfoForm.value.adresse.city || '',
        postalCode: this.personalInfoForm.value.adresse.postalCode || '',
        country: this.personalInfoForm.value.adresse.country || ''
      }
    };

    this.userService.updateUser(this.currentUser.id_user, userUpdate).subscribe({
      next: (response) => {
        this.isUpdatingInfo = false;
        this.updateSuccessMessage = 'Informations mises à jour avec succès !';
        
        // Update current user with new data
        this.currentUser = { ...this.currentUser, ...response };
        
        // Close personal info form and show confirmation modal
        setTimeout(() => {
          this.showPersonalInfoForm = false;
          this.showConfirmationModal = true;
          this.updateSuccessMessage = '';
        }, 1000);
      },
      error: (error) => {
        this.isUpdatingInfo = false;
        console.error('Update error:', error);
        
        if (error.status === 401 || error.status === 403) {
          this.updateErrorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 400) {
          this.updateErrorMessage = 'Données invalides. Veuillez vérifier vos informations.';
        } else if (error.status === 0) {
          this.updateErrorMessage = 'Impossible de se connecter au serveur';
        } else {
          this.updateErrorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  confirmOrder(): void {
    this.showConfirmationModal = false;
    this.initiatePaymentWithoutOrder();
  }

  // ================= NEW PAYMENT FLOW =================

  /**
   * NEW FLOW: Generate payment link without creating order
   * Cart stays intact until payment succeeds
   */
  private initiatePaymentWithoutOrder(): void {

    this.isCheckingOut = true;

    const user = this.authService.getFullUser();
    if (!user || !user.id_user) {
      alert('User information not found');
      this.isCheckingOut = false;
      return;
    }

    // Convert cart to DTO format
    const cartItemsDTO: CartItemDTO[] = this.cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      productoption: item.productoption 
    }));

    const request: PaymentInitiateRequest = {
      userId: user.id_user,
      totalAmount: this.getTotalPrice(),
      cartItems: cartItemsDTO
    };

    console.log('💳 Initiating payment (no order created yet)');

    this.paymentService.initiatePaymentOnly(request).subscribe({

      next: (response) => {

        if (response.success && response.paymentLink) {

          console.log('✅ Payment link generated:', response.paymentId);

          // Store payment data in sessionStorage for success page
          const paymentData = {
            paymentId: response.paymentId,
            userId: user.id_user,
            totalAmount: this.getTotalPrice(),
            cartItems: cartItemsDTO
          };

          sessionStorage.setItem('pendingPaymentData', JSON.stringify(paymentData));

          // IMPORTANT: Do NOT clear cart here - cart stays until payment succeeds
          console.log('🛒 Cart preserved - will clear only on success');

          // Redirect to Flouci payment page
          window.location.href = response.paymentLink;

        } else {
          throw new Error('Invalid payment response');
        }
      },

      error: (err) => {
        console.error('❌ Payment initiation error:', err);
        alert('Payment error. Please try again later.');
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

  closePersonalInfoForm(): void {
    this.showPersonalInfoForm = false;
    this.updateErrorMessage = '';
    this.updateSuccessMessage = '';
  }

}
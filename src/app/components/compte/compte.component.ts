import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { UserServiceService } from '../../services/user-service.service';
import { GoogleAuthService } from '../../services/google-auth.service';
import { Order, OrderState } from '../../models/order';
import { OrderServiceService } from '../../services/order-service.service';

@Component({
  selector: 'app-compte',
  templateUrl: './compte.component.html',
  styleUrl: './compte.component.css'
})
export class CompteComponent implements OnInit, AfterViewInit {
  @ViewChild('googleLoginButton') googleLoginButton!: ElementRef;
  @ViewChild('googleRegisterButton') googleRegisterButton!: ElementRef;

  googleLoading = false;
  private googleSDKLoaded = false;
  
  // Navigation
  activeSection: 'orders' | 'personal' | 'addresses' = 'personal';
  
  // Auth tabs
  activeTab: 'login' | 'register' = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  accountForm: FormGroup;
  
  loading = false;
  updating = false;
  logoutLoading = false;
  ordersLoading = false;
  
  errorMessage: string = '';
  successMessage: string = '';
  
  isLoggedIn = false;
  currentUser: any = null;
  currentUser2: any = null;
  registerStep: 1 | 2 = 1;
  
  // Orders
  userOrders: Order[] = [];
  selectedOrder: Order | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserServiceService,
    private orderService: OrderServiceService,
    public router: Router,
    private googleAuthService: GoogleAuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telephone: ['', [Validators.pattern(/^[0-9+\s-()]*$/)]],
      adresse: this.fb.group({
        country: ['', Validators.required],
        city: ['', Validators.required],
        street: [''],
        postalCode: [''],
        houseNumber: ['']
      })
    });

    this.accountForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.pattern(/^[0-9+\s-()]*$/)]],
      adresse: this.fb.group({
        street: [''],
        houseNumber: [''],
        city: [''],
        postalCode: [''],
        country: ['']
      })
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      this.currentUser = this.authService.getFullUser();
      this.loadUserData();
      this.loadUserOrders();
    }

    this.authService.isLoggedIn$().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.currentUser = this.authService.getFullUser();
        this.loadUserData();
        this.loadUserOrders();
      } else {
        this.currentUser = null;
        this.currentUser2 = null;
        this.userOrders = [];
        this.accountForm.reset();
      }
    });

    // Initialize Google Sign-In with a callback to track when it's ready
    // Only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.googleAuthService.initializeGoogleSignIn(
        this.handleGoogleSignIn.bind(this)
      );
      
      // Wait for Google SDK to load before marking as ready
      this.waitForGoogleSDK();
    }
  }

  ngAfterViewInit(): void {
    // Wait for SDK to be loaded before rendering
    this.tryRenderGoogleButtons();
  }

  private waitForGoogleSDK(): void {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if google.accounts is available
    const checkGoogleSDK = setInterval(() => {
      if (typeof (window as any).google !== 'undefined' && 
          (window as any).google?.accounts?.id) {
        this.googleSDKLoaded = true;
        clearInterval(checkGoogleSDK);
        this.tryRenderGoogleButtons();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkGoogleSDK);
      if (!this.googleSDKLoaded) {
        console.warn('Google SDK failed to load within 10 seconds');
      }
    }, 10000);
  }

  private tryRenderGoogleButtons(): void {
    // Only try to render if SDK is loaded and we're in browser
    if (!this.googleSDKLoaded || !isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => {
      if (this.googleLoginButton && this.activeTab === 'login') {
        this.renderGoogleButton(this.googleLoginButton.nativeElement);
      }
      if (this.googleRegisterButton && this.activeTab === 'register' && this.registerStep === 1) {
        this.renderGoogleButton(this.googleRegisterButton.nativeElement);
      }
      this.cdr.detectChanges();
    }, 200);
  }

  private renderGoogleButton(element: HTMLElement): void {
    if (element && this.googleSDKLoaded && isPlatformBrowser(this.platformId)) {
      try {
        this.googleAuthService.renderButton(element, {
          width: element.offsetWidth || 300
        });
      } catch (error) {
        console.error('Error rendering Google button:', error);
      }
    }
  }

  // Navigation
  navigateToSection(section: 'orders' | 'personal' | 'addresses'): void {
    this.activeSection = section;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Load user orders
  loadUserOrders(): void {
    if (this.currentUser && this.currentUser.id_user) {
      this.ordersLoading = true;
      this.orderService.getByUserId(this.currentUser.id_user).subscribe({
        next: (orders: any) => {
          this.ordersLoading = false;
          // Handle both single order and array response
          this.userOrders = Array.isArray(orders) ? orders : [orders];
          console.log('User orders:', this.userOrders);
        },
        error: (error) => {
          this.ordersLoading = false;
          console.error('Error loading orders:', error);
          this.userOrders = [];
        }
      });
    }
  }

  getOrderStateLabel(state: OrderState): string {
    const labels: { [key in OrderState]: string } = {
      [OrderState.CREATED]: 'Créée',
      [OrderState.CONFIRMED]: 'Confirmée',
      [OrderState.SHIPPED]: 'Expédiée',
      [OrderState.DELIVERED]: 'Livrée',
      [OrderState.CANCELLED]: 'Annulée'
    };
    return labels[state] || state;
  }

  getOrderStateClass(state: OrderState): string {
    const classes: { [key in OrderState]: string } = {
      [OrderState.CREATED]: 'order-created',
      [OrderState.CONFIRMED]: 'order-confirmed',
      [OrderState.SHIPPED]: 'order-shipped',
      [OrderState.DELIVERED]: 'order-delivered',
      [OrderState.CANCELLED]: 'order-cancelled'
    };
    return classes[state] || '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  handleGoogleSignIn(response: any): void {
    if (response.credential) {
      this.googleLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.loginWithGoogle(response.credential).subscribe({
        next: (authResponse) => {
          this.googleLoading = false;
          this.successMessage = 'Connexion avec Google réussie !';
          this.isLoggedIn = true;
          this.currentUser = this.authService.getFullUser();
          this.loadUserData();
          this.loadUserOrders();

          setTimeout(() => {
            const userRole = this.authService.getUserRole();
            if (userRole === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/']);
            }
          }, 1500);
        },
        error: (error) => {
          this.googleLoading = false;
          console.error('Google login failed', error);
          
          if (error.status === 400) {
            this.errorMessage = 'Token Google invalide. Veuillez réessayer.';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur';
          } else {
            this.errorMessage = 'Échec de la connexion avec Google. Veuillez réessayer.';
          }
        }
      });
    }
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';

    // Re-render Google button for the active tab
    this.tryRenderGoogleButtons();
  }

  goToStep(step: 1 | 2): void {
    this.registerStep = step;
    
    // Re-render Google button when going back to step 1
    if (step === 1) {
      this.tryRenderGoogleButtons();
    }
  }

  isStep1Valid(): boolean {
    return (
      this.registerForm.get('nom')?.valid &&
      this.registerForm.get('prenom')?.valid &&
      this.registerForm.get('email')?.valid &&
      this.registerForm.get('password')?.valid
    );
  }

  private loadUserData(): void {
    if (this.currentUser && this.currentUser.id_user) {
      this.userService.getUserById(this.currentUser.id_user).subscribe({
        next: (data) => {
          this.currentUser2 = data;
          console.log('Full user data:', this.currentUser2);
          this.populateAccountForm();
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.populateAccountForm();
        }
      });
    }
  }

  private populateAccountForm(): void {
    const userData = this.currentUser2 || this.currentUser;
    
    if (userData) {
      this.accountForm.patchValue({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        telephone: userData.telephone || '',
        adresse: {
          street: userData.adresse?.street || '',
          houseNumber: userData.adresse?.houseNumber || '',
          city: userData.adresse?.city || '',
          postalCode: userData.adresse?.postalCode || '',
          country: userData.adresse?.country || ''
        }
      });
    }
  }

  onUpdateAccount(): void {
    if (this.accountForm.invalid) {
      this.markFormGroupTouched(this.accountForm);
      return;
    }

    this.updating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userUpdate: User = {
      id_user: this.currentUser.id_user,
      mail: this.currentUser.mail,
      password: this.currentUser.password,
      role: this.currentUser.role,
      nom: this.accountForm.value.nom,
      prenom: this.accountForm.value.prenom,
      telephone: this.accountForm.value.telephone,
      adresse: {
        street: this.accountForm.value.adresse.street || '',
        houseNumber: this.accountForm.value.adresse.houseNumber || '',
        city: this.accountForm.value.adresse.city || '',
        postalCode: this.accountForm.value.adresse.postalCode || '',
        country: this.accountForm.value.adresse.country || ''
      }
    };

    this.userService.updateUser(this.currentUser.id_user, userUpdate).subscribe({
      next: (response) => {
        this.updating = false;
        this.successMessage = "Vos informations ont été mises à jour avec succès !";
        
        this.currentUser = { ...this.currentUser, ...response };
        this.currentUser2 = { ...this.currentUser2, ...response };
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.updating = false;
        console.error('Update error:', error);
        
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 400) {
          this.errorMessage = 'Données invalides. Veuillez vérifier vos informations.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Connexion réussie !';
        this.isLoggedIn = true;
        this.currentUser = this.authService.getCurrentUser();
        this.loadUserData();
        this.loadUserOrders();
        
        this.loginForm.reset();
        
        setTimeout(() => {
          const userRole = this.authService.getUserRole();
          if (userRole === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData = {
      nom: this.registerForm.value.nom,
      prenom: this.registerForm.value.prenom,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      telephone: this.registerForm.value.telephone,
      adresse: this.registerForm.value.adresse
    };
    
    this.registerStep = 1;

    this.authService.signup(userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        this.isLoggedIn = true;
        this.currentUser = this.authService.getFullUser();
        this.loadUserData();
        this.loadUserOrders();
        
        this.registerForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/redirectpage']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        console.error('Registration error:', error);
        
        if (error.status === 409) {
          this.errorMessage = 'Cet email est déjà utilisé';
        } else if (error.status === 400) {
          this.errorMessage = 'Données invalides. Veuillez vérifier vos informations.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  onLogout(): void {
    this.logoutLoading = true;
    this.errorMessage = '';

    this.authService.logout().subscribe({
      next: () => {
        this.logoutLoading = false;
        this.successMessage = 'Déconnexion réussie !';
        this.isLoggedIn = false;
        this.currentUser = null;
        this.currentUser2 = null;
        this.userOrders = [];
        this.accountForm.reset();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        this.logoutLoading = false;
        console.error('Logout error:', error);
        
        this.authService.logoutClientSide();
        this.isLoggedIn = false;
        this.currentUser = null;
        this.currentUser2 = null;
        this.userOrders = [];
        this.accountForm.reset();
        this.errorMessage = 'Déconnexion effectuée (erreur serveur ignorée)';
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string, formGroup: FormGroup = this.accountForm): string {
    const control = formGroup.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Veuillez entrer une adresse email valide';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (control?.hasError('pattern')) {
      return 'Format invalide';
    }
    
    return '';
  }

  shouldShowError(controlName: string, formGroup: FormGroup = this.accountForm): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Validation helpers for login form
  getLoginErrorMessage(controlName: string): string {
    return this.getErrorMessage(controlName, this.loginForm);
  }

  shouldShowLoginError(controlName: string): boolean {
    return this.shouldShowError(controlName, this.loginForm);
  }

  // Validation helpers for register form
  getRegisterErrorMessage(controlName: string): string {
    return this.getErrorMessage(controlName, this.registerForm);
  }

  shouldShowRegisterError(controlName: string): boolean {
    return this.shouldShowError(controlName, this.registerForm);
  }
}
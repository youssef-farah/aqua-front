import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { UserServiceService } from '../../services/user-service.service';

@Component({
  selector: 'app-compte',
  templateUrl: './compte.component.html',
  styleUrl: './compte.component.css'
})export class CompteComponent implements OnInit {
  activeTab: 'login' | 'register' = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  accountForm: FormGroup;
  
  loading = false;
  updating = false;
  logoutLoading = false;
  
  errorMessage: string = '';
  successMessage: string = '';
  
  isLoggedIn = false;
  currentUser: any = null;
  currentUser2: any = null;
registerStep: 1 | 2 = 1;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserServiceService,
    public router: Router
  ) {
    // Login form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Register form
  this.registerForm = this.fb.group({
  nom: ['', [Validators.required, Validators.minLength(2)]],
  prenom: ['', [Validators.required, Validators.minLength(2)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],

  telephone: ['', [Validators.pattern(/^[0-9+\s-()]*$/)]],

  adresse: this.fb.group({
    country: [''],
    city: [''],
    street: [''],
    postalCode: [''],
    houseNumber: ['']
  })
});


    // Combined account form for display and update
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
    }

    // Subscribe to login status changes
    this.authService.isLoggedIn$().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.currentUser = this.authService.getFullUser();
        this.loadUserData();
      } else {
        this.currentUser = null;
        this.currentUser2 = null;
        this.accountForm.reset();
      }
    });
  }


  goToStep(step: 1 | 2): void {
  this.registerStep = step;
}

isStep1Valid(): boolean {
  return (
    this.registerForm.get('nom')?.valid &&
    this.registerForm.get('prenom')?.valid &&
    this.registerForm.get('email')?.valid &&
    this.registerForm.get('password')?.valid
  );
}

  /**
   * Load full user data from backend
   */
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
          // Fallback to currentUser if API fails
          this.populateAccountForm();
        }
      });
    }
  }

  /**
   * Populate account form with current user data
   */
  private populateAccountForm(): void {
    // Use currentUser2 (full data) if available, otherwise fallback to currentUser
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

  /**
   * Update user account information
   */
  onUpdateAccount(): void {
    if (this.accountForm.invalid) {
      this.markFormGroupTouched(this.accountForm);
      return;
    }

    this.updating = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ Create a complete User object matching the backend User entity
    const userUpdate: User = {
      id_user: this.currentUser.id_user,
      mail: this.currentUser.mail, // Keep existing email
      password: this.currentUser.password, // Keep existing password (hashed)
      role: this.currentUser.role, // Keep existing role
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

    console.log('📤 Sending update:', userUpdate);
    console.log('📤 Sending update JSON:', JSON.stringify(userUpdate));

    this.userService.updateUser(this.currentUser.id_user, userUpdate).subscribe({
      next: (response) => {
        this.updating = false;
        this.successMessage = "Vos informations ont été mises à jour avec succès !";
        
        // Update both user objects
        this.currentUser = { ...this.currentUser, ...response };
        this.currentUser2 = { ...this.currentUser2, ...response };
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.updating = false;
        console.error('❌ Update error:', error);
        
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
        console.log(userData);
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        this.isLoggedIn = true;
        this.currentUser = this.authService.getFullUser();
        this.loadUserData();
        
        this.registerForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/compte']);
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

  getErrorMessage(controlName: string): string {
    const control = this.accountForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
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

  shouldShowError(controlName: string): boolean {
    const control = this.accountForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
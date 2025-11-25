import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-compte',
  templateUrl: './compte.component.html',
  styleUrl: './compte.component.css'
})
export class CompteComponent {


  activeTab: 'login' | 'register' = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      telephone: [''],
      adresse: [''],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    setTimeout(() => {
      alert('Connexion réussie !');
      this.loading = false;
    }, 1000);
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    setTimeout(() => {
      alert('Compte créé avec succès !');
      this.loading = false;
    }, 1000);
  }
}

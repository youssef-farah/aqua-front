import { Injectable } from '@angular/core';



declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

   private clientId = '487448348751-2rhms53c2a187o9d8hmd95nlc7c9odv7.apps.googleusercontent.com';

  constructor() {}

  /**
   * Initialize Google Sign-In
   */
  initializeGoogleSignIn(callback: (response: any) => void): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    } else {
      console.error('Google Sign-In SDK not loaded');
    }
  }

  /**
   * Render Google Sign-In button
   */
  renderButton(element: HTMLElement, options?: any): void {
    if (typeof google !== 'undefined' && google.accounts) {
      const defaultOptions = {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: element.offsetWidth || 300,
        logo_alignment: 'left'
      };

      google.accounts.id.renderButton(
        element,
        { ...defaultOptions, ...options }
      );
    } else {
      console.error('Google Sign-In SDK not loaded');
    }
  }

  /**
   * Prompt One Tap login (optional)
   */
  promptOneTap(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt();
    }
  }
}

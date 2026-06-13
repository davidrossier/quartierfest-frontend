import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/** UC-014: Login-Seite — eigenes Formular, kein externer IdP. */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  ladevorgang = signal(false);
  fehler = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    passwort: ['', Validators.required],
  });

  anmelden(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.ladevorgang.set(true);
    this.fehler.set(null);
    const { email, passwort } = this.loginForm.getRawValue();
    this.authService.login(email!, passwort!).subscribe({
      next: () => {
        this.ladevorgang.set(false);
        this.router.navigateByUrl(this.authService.startSeite());
      },
      error: (err) => {
        this.ladevorgang.set(false);
        this.fehler.set(
          err?.status === 401
            ? 'E-Mail-Adresse oder Passwort falsch.'
            : 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
        );
      },
    });
  }
}

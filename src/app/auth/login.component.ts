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
        this.fehler.set(this.fehlermeldung(err?.status));
      },
    });
  }

  /** UC-014 E1 (401) und SEC-002 Brute-Force-Sperre (429) — bewusst generische Meldungen. */
  private fehlermeldung(status: number | undefined): string {
    switch (status) {
      case 401:
        return 'E-Mail-Adresse oder Passwort falsch.';
      case 429:
        return 'Zu viele Fehlversuche. Bitte versuchen Sie es in 15 Minuten erneut.';
      default:
        return 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    }
  }
}

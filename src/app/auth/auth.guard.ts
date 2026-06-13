import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rolle } from './auth.service';

/** UC-014: schützt alle App-Routen — ohne Sitzung geht es zu /login. */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.istAngemeldet() ? true : router.createUrlTree(['/login']);
};

/** UC-014: rollenbasierter Zugriff; falsche Rolle landet auf der eigenen Startseite. */
export const roleGuard =
  (rolle: Rolle): CanActivateFn =>
  () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (!authService.istAngemeldet()) {
      return router.createUrlTree(['/login']);
    }
    return authService.rolle() === rolle ? true : router.createUrlTree([authService.startSeite()]);
  };

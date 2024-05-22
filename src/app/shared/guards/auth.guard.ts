import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PLATFORM_ID, inject } from '@angular/core';
import { map, take } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    return authService.checkLogin().pipe(
      map((loggedIn) => {
        if (loggedIn) {
          return true;
        } else {
          router.navigate(['/login']);
          return false;
        }
      })
    );
  }
  return false;
};

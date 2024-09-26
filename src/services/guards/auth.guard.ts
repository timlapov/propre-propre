import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService} from "../auth.service";

// Guard to protect routes that require authentication.
// Redirects to the login page if the user is not authenticated.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLogged()) {
    return true;
  } else {
    return router.createUrlTree(['login']);
  }
};

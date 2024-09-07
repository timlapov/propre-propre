import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from "../auth.service";
import {inject} from "@angular/core";

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['requiredRole'] as string;

  if (authService.isLogged() && authService.hasRole(requiredRole)) {
    return true;
  }

  router.navigate([authService.getUserProfileRoute()]);
  return false;
};

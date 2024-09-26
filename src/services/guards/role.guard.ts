import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from "../auth.service";
import { inject } from "@angular/core";
import { of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import {ITokenResponse} from "../auth";

// Guard to protect routes based on user roles.
// Checks if the user has the required role and handles token refresh if necessary.
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['requiredRole'] as string;

  // Check if user is logged in and has the required role
  if (authService.isLogged() && authService.hasRole(requiredRole)) {
    return true;
  }

  const token = authService.getToken();

  // If token exists and is expired, attempt to refresh it
  if (token && authService.isTokenExpired()) {
    return authService.refreshToken().pipe(
      map((tokenData: ITokenResponse) => {
        // After refreshing, check authentication and role again
        if (authService.isLogged() && authService.hasRole(requiredRole)) {
          return true;
        } else {
          // Redirect to user profile or appropriate route
          return router.createUrlTree([authService.getUserProfileRoute()]);
        }
      }),
      catchError(error => {
        authService.logout();
        return of(false);
      })
    );
  }

  return router.createUrlTree([authService.getUserProfileRoute()]);
};

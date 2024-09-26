import {HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, filter, Observable, switchMap, take, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import {ITokenResponse} from "./auth";

// Flag to indicate if token refresh is in progress
let isRefreshing = false;

// Subject to broadcast new tokens to pending requests
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  // Skip adding token for login and token refresh requests
  if (req.url.includes('/api/login') || req.url.includes('/api/token/refresh')) {
    return next(req);
  }

  // Add token to the request headers
  return next(addToken(req, authService.getToken())).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Handle 401 errors by attempting to refresh the token
        return handleUnauthorizedError(req, next, authService);
      }
      return throwError(() => error);
    })
  );
}

// Function to add Authorization header to requests
function addToken(request: HttpRequest<any>, token: string | null) {
  if (token) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return request;
}

// Function to handle token refresh logic
function handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((token: ITokenResponse) => {
        isRefreshing = false;
        refreshTokenSubject.next(token.token);
        // Retry the failed request with the new token
        return next(addToken(request, token.token));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Wait for the token to be refreshed and then retry the request
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next(addToken(request, token));
      })
    );
  }
}

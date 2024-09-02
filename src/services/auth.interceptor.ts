import {HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, filter, Observable, switchMap, take, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import {IToken} from "./auth";

// export function authInterceptor (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
//   const authService = inject(AuthService);
//   const token = authService.getToken();
//   //
//   if (req.url.includes('/api/login') || req.url.includes('/api/token/refresh')) {
//     return next(req);
//   }
//   //
//
//   if (token) {
//     req = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//   }
//
//   return next(req).pipe(
//     catchError(error => {
//       if (error.status === 401) {
//         authService.logout();
//       }
//       return throwError(error);
//     })
//   );
// }

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  if (req.url.includes('/api/login') || req.url.includes('/api/token/refresh')) {
    return next(req);
  }

  return next(addToken(req, authService.getToken())).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handleUnauthorizedError(req, next, authService);
      }
      return throwError(error);
    })
  );
}

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

function handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((token: IToken) => {
        isRefreshing = false;
        refreshTokenSubject.next(token.token);
        return next(addToken(request, token.token));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next(addToken(request, token));
      })
    );
  }
}

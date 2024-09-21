import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from "../auth.service";
import { inject } from "@angular/core";
import { Observable, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import {IToken} from "../auth";

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['requiredRole'] as string;

  console.log('roleGuard: Проверка доступа к маршруту', state.url);

  // Если пользователь авторизован и имеет необходимую роль
  if (authService.isLogged() && authService.hasRole(requiredRole)) {
    console.log('roleGuard: Доступ разрешен');
    return true;
  }

  const token = authService.getToken();

  // Если токен существует и истёк, пытаемся его обновить
  if (token && authService.isTokenExpired()) {
    console.log('roleGuard: Токен истек, пытаемся обновить');
    return authService.refreshToken().pipe(
      map((tokenData: IToken) => {
        // После обновления токена проверяем роль снова
        if (authService.isLogged() && authService.hasRole(requiredRole)) {
          console.log('roleGuard: Токен обновлен, доступ разрешен');
          return true;
        } else {
          console.log('roleGuard: Токен обновлен, но роль не соответствует');
          // Перенаправляем на соответствующий маршрут
          return router.createUrlTree([authService.getUserProfileRoute()]);
        }
      }),
      catchError(error => {
        console.error('roleGuard: Обновление токена не удалось', error);
        authService.logout();
        return of(false);
      })
    );
  }

  // Если пользователь не авторизован или не имеет необходимой роли
  console.log('roleGuard: Доступ запрещен. Перенаправление на', authService.getUserProfileRoute());
  return router.createUrlTree([authService.getUserProfileRoute()]);
};

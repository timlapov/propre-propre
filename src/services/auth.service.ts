import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap, throwError} from 'rxjs';
import { Router } from '@angular/router';
import {DecodedToken, IToken} from "./auth";
import {jwtDecode} from "jwt-decode";
import {environment} from "../environments/environment";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
  }

  login(credentials: { email: string; password: string }): Observable<IToken> {
    return this.http.post<IToken>(`${this.url}api/login`, credentials).pipe(
      tap(tokenData => this.saveTokens(tokenData.token, tokenData.refresh_token))
    );
  }

  refreshToken(): Observable<IToken> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('Отсутствует refresh token. Выполняется logout.');
      this.logout();
      return throwError(() => 'No refresh token available');
    }
    console.log('Попытка обновления токена...');
    return this.http.post<IToken>(`${this.url}api/token/refresh`, { refresh_token: refreshToken }).pipe(
      tap(tokenData => {
        console.log('Токен обновлен:', tokenData);
        this.saveTokens(tokenData.token, tokenData.refresh_token);
      }),
      catchError(error => {
        console.error('Ошибка при обновлении токена:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  saveTokens(token: string, refreshToken: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    const decodedToken = jwtDecode<IToken>(token);
    return decodedToken.exp * 1000 < Date.now();
  }

  isLogged(): boolean {
    // const token = this.getToken();
    // /*ici on va proteger le token voir en dessous pour installer jwt-decode */
    // if (!token) return false;
    // try {
    //   const decodedToken = jwtDecode<IToken>(token);
    //   return decodedToken.exp > Date.now() / 1000;
    // } catch (error) {
    //   return false;
    // }
    return !!this.getToken() && !this.isTokenExpired();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // logout(): void {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('refreshToken');
  //   this.router.navigate(['login']).then(() => {
  //     window.location.reload(); // Ensure full reload to reset application state
  //   });
  // }
  logout(): void {
    console.log('AuthService.logout() вызван');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['login']);
  }

  getCurrentUser(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Erreur lors du décodage du token :', error);
      return null;
    }
  }
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(role) : false;
  }

  getUserProfileRoute(): string {
    if (this.isLogged()) {
      const user = this.getCurrentUser();
      if (user) {
        if (user.roles.includes('ROLE_EMPLOYEE')) {
          return '/employee/dashboard';
        } else if (user.roles.includes('ROLE_USER')) {
          return '/client/profile';
        }
      }
    }
    return '/login';
  }

  getClientId(): number | null {
    const user = this.getCurrentUser();
    if (user && user.id) {
      return user.id;
    }
    return null;
  }

}

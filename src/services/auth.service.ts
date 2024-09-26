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
      this.logout();
      return throwError(() => 'No refresh token available');
    }
    return this.http.post<IToken>(`${this.url}api/token/refresh`, { refresh_token: refreshToken }).pipe(
      tap(tokenData => {
        this.saveTokens(tokenData.token, tokenData.refresh_token);
      }),
      catchError(error => {
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
    return !!this.getToken() && !this.isTokenExpired();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  logout(): void {
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { IToken } from "./auth";
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<IToken> {
    return this.http.post<IToken>(`${this.url}api/login`, credentials);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  isLogged(): boolean {
    const token = this.getToken();
    /*ici on va proteger le token voir en dessous pour installer jwt-decode */
    if (!token) return false;
    try {
      const decodedToken = jwtDecode<IToken>(token);
      return decodedToken.exp > Date.now() / 1000;
    } catch (error) {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['login']);
  }
}

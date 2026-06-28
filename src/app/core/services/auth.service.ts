import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorageKey = 'access_token';
  private readonly loginUrl = `${environment.apiBaseUrl}/api/Auth/login`;

  login(credentials: LoginRequest): Observable<string> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials).pipe(
      map((response) => response.token ?? response.accessToken ?? response.data?.token ?? response.data?.accessToken ?? ''),
      tap((token) => {
        if (token) {
          this.setToken(token);
        }
      }),
    );
  }

  register(data: any): Observable<any> {
    const registerUrl = `${environment.apiBaseUrl}/api/Auth/register`;
    return this.http.post<any>(registerUrl, data);
  }

  forgotPassword(email: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/api/Auth/forgot-password`;
    return this.http.post<any>(url, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/api/Auth/reset-password`;
    return this.http.post<any>(url, { token, newPassword });
  }

  logout(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(this.tokenStorageKey);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.tokenStorageKey);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.tokenStorageKey, token);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = this.decodeTokenPayload(token);
    const expiresAt = payload?.exp;
    if (typeof expiresAt !== 'number') {
      return true;
    }

    return expiresAt * 1000 > Date.now();
  }

  getCurrentUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodeTokenPayload(token);
    if (!payload) return null;
    const userIdStr = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.sub;
    return userIdStr ? parseInt(userIdStr, 10) : null;
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodeTokenPayload(token);
    if (!payload) return false;

    const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || payload.roles;
    if (!roleClaim) return false;

    if (Array.isArray(roleClaim)) {
      return roleClaim.some(r => r === 'Admin' || r === 'admin');
    }
    return roleClaim === 'Admin' || roleClaim === 'admin';
  }

  private decodeTokenPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }
}

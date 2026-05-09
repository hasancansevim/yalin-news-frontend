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

  private decodeTokenPayload(token: string): { exp?: number } | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      const payload = JSON.parse(atob(parts[1]));
      return payload as { exp?: number };
    } catch {
      return null;
    }
  }
}

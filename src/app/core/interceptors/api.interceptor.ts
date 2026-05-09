import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const requestId =
    typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : Date.now().toString();

  const cloned = req.clone({
    setHeaders: {
      'X-Request-Id': requestId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return next(cloned);
};

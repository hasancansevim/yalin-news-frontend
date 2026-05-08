import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
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

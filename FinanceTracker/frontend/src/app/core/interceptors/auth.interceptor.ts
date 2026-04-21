import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  let token: string | null = null;
  try {
    const stored = sessionStorage.getItem('ft_tokens');
    if (stored) token = JSON.parse(stored).access;
  } catch {}

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        sessionStorage.removeItem('ft_tokens');
        sessionStorage.removeItem('ft_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
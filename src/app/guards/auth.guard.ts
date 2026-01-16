import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    // Token exists, allow access
    return true;
  } else {
    // No token, redirect to login page
    router.navigate(['/']);
    return false;
  }
};
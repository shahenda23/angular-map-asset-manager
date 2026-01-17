import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router:Router) { }

  // login(credentials: any): Observable<any> {
  //   console.log('Attempting login to:', `${environment.apiUrl}/Account/login`);
  //   return this.http.post(`${environment.apiUrl}/Account/login`, credentials).pipe(
  //     tap((res: any) => {
  //       console.log('Login Success!', res);
  //       localStorage.setItem('token', res.token);
  //     })
  //   );
  // }

  login(credentials: any): Observable<any> {
  console.log('Attempting login to:', `${environment.apiUrl}/Account/login`);
  return this.http.post(`${environment.apiUrl}/Account/login`, credentials).pipe(
    tap((res: any) => {
      console.log('Login Success!', res);
      localStorage.setItem('token', res.token);
    }),
    catchError(error => {
      console.error('Login failed:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      throw error;
    })
  );
}

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
  localStorage.removeItem('token');
  this.router.navigate(['/']);
}

  register(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Account/register`, data);
  }
}



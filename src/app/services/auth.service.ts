import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router:Router) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Account/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
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



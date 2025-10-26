// auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8084/auth';
  private userRoleSubject = new BehaviorSubject<number | null>(null);
  public userRole$: Observable<number | null> = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { 
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      this.userRoleSubject.next(parseInt(storedRole, 10));
    }
  }

  login(credentials: { email: string, password: string }) {
    return this.http.post<{ token: string, roleId: number }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.saveToken(response.token);
          this.saveUserRole(response.roleId);
        })
      );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  saveUserRole(roleId: number) {
    localStorage.setItem('userRole', roleId.toString());
    this.userRoleSubject.next(roleId);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.userRoleSubject.next(null); 
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  // Nuevo método auxiliar para usar la lógica de roles fuera del Navbar
  isUserAdmin(): boolean {
      return this.userRoleSubject.value === 1; // ID 1 es 'admin'
  }
}
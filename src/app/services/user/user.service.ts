import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterRequest } from '../../interfaces/usuario.interface';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8084/auth';

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios (si existe este endpoint en tu backend)
  getAllUsers(): Observable<RegisterRequest[]> {
    return this.http.get<RegisterRequest[]>(`${this.apiUrl}/users`);
  }

  // Registrar usuario ✅ ya corregido
  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrarse`, registerRequest);
  }
}
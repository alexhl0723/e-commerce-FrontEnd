import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8084/auth';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }){
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`,credentials);
  }

  saveToken( token: string ){
    localStorage.setItem('token', token);//guardar el token en el localStorage
  }

  getToken(){
    return localStorage.getItem('token');//obtener el token del localStorage
  }

  logout(){
    localStorage.removeItem('token');//remover el token del localStorage
  }



}

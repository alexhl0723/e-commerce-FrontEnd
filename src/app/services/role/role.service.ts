import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role } from '../../interfaces/role.interface';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private endpoint = 'http://localhost:8084/role';
  
  constructor(private http: HttpClient) { }

  getRoles(){
    return this.http.get<Role[]>(`${this.endpoint}`);
  }

  obtenerPorId(id: number){
    return this.http.get<Role>(`${this.endpoint}/${id}`);
  }

  crearRole(role: Role){
    return this.http.post<Role>(this.endpoint, role);
  }

  actualizarRole(id: number, role: Role){
    return this.http.put<Role>(`${this.endpoint}/${id}`, role);
  }

  eliminarRole(id: number){
    return this.http.delete(`${this.endpoint}/${id}`);
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Categoria } from '../../interfaces/categoria.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  
  private baseUrl = 'http://localhost:8084/categoria';

  constructor(private http: HttpClient) { }

  private getHeader(){
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  }

  listarCategorias() {
    return this.http.get<Categoria[]>(this.baseUrl, this.getHeader());
  }

  obtenerPorId(id: number) {
    return this.http.get<Categoria>(`${this.baseUrl}/${id}`, this.getHeader());
  }

  crearCategoria(categoria: Categoria) {
    return this.http.post<Categoria>(this.baseUrl, categoria, this.getHeader());
  }

  actualizarCategoria(id: number, categoria: Categoria) {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, categoria, this.getHeader());
  }

  eliminarCategoria(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHeader());
  }

actualizarEstado(id: number, estado: boolean) {
  return this.http.put(
    `${this.baseUrl}/${id}/estado?estado=${estado}`,
    {},
    {
      ...this.getHeader(),
      responseType: 'text' as 'json'
    }
  );
}
}
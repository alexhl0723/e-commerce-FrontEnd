import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Producto } from '../../interfaces/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private baseUrl = 'http://localhost:8084/producto';
  private uploadUrl = 'http://localhost:8084/imagenes/subir';
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

  listarProductos(){
    return this.http.get<Producto[]>(this.baseUrl, this.getHeader());
  }

  buscarProductos(termino: string){
    return this.http.get<Producto[]>(`${this.baseUrl}/buscar?nombre=${termino}`, this.getHeader());
  }

  obtenerPorId(id: number){
    return this.http.get<Producto>(`${this.baseUrl}/${id}`, this.getHeader());
  }

  crearProducto(producto: Producto){
    return this.http.post<Producto>(this.baseUrl, producto, this.getHeader());
  }

  actualizarProducto(id: number, producto: Producto){
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto, this.getHeader());
  }

  eliminarProducto(id: number){
    return this.http.delete<Producto>(`${this.baseUrl}/${id}`, this.getHeader());
  }

  // Subida de imágenes usando FormData
  subirImagenes(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('imagenes', file));
    
    // Get the token manually since we're using FormData
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type, let the browser set it with the correct boundary
    });
    
    return this.http.post<any>(this.uploadUrl, formData, { headers });
  }

}

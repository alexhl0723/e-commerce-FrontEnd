import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carrito } from '../../interfaces/carrito.interface';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'http://localhost:8084/carrito';

  constructor(private http: HttpClient) { }

  // Obtener el carrito por idCliente
  getCarritoPorIdCliente(idCliente: number): Observable<Carrito[]> {
    const params = new HttpParams().set('idCliente', idCliente.toString());
    return this.http.get<Carrito[]>(this.apiUrl, { params });
  }

  // Eliminar un ítem del carrito por su ID
  eliminarCarrito(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Agregar un nuevo producto al carrito
  crearCarrito(carrito: Carrito): Observable<Carrito> {
    return this.http.post<Carrito>(`${this.apiUrl}/agregar`, carrito);
  }

  // Agregar o actualizar un producto en el carrito (evita duplicados)
  agregarOActualizar(carrito: Carrito): Observable<Carrito> {
    return this.http.post<Carrito>(`${this.apiUrl}/agregar-o-actualizar`, carrito);
  }

  // Actualizar cantidad de un producto existente en el carrito
  actualizarCantidadCarrito(idCliente: number, cantidad: number): Observable<Carrito> {
    const params = new HttpParams()
      .set('idCliente', idCliente.toString())
      .set('cantidad', cantidad.toString());
    return this.http.put<Carrito>(`${this.apiUrl}/actualizar-cantidad`, null, { params });
  }
}

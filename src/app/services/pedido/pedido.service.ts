import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Pedido } from "../../interfaces/pedido.interface";

@Injectable({
    providedIn: 'root'
})

export class PedidoService{

    private baseUrl = 'http://localhost:8084/pedidos'
    
    constructor(private http: HttpClient){}

    listar(): Observable<Pedido[]>{
        return this.http.get<Pedido[]>(this.baseUrl);
    }

    buscarPorUsuario(idUsuario: number): Observable<Pedido[]>{
        return this.http.get<Pedido[]>(`${this.baseUrl}/usuario/${idUsuario}`)

    }

    buscarPorEstado(estado: String){

    }

    crear(pedido: Pedido): Observable<Pedido>{
        return this.http.post<Pedido>(this.baseUrl,pedido)
    }

    actualizar(){

    }

    actualizarEstado(){

    }

    eliminar(){

    }

}
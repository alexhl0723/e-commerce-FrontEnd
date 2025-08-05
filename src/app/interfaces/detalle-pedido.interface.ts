import { Pedido } from "./pedido.interface";
import { Producto } from "./producto.interface";

export interface DetallePedido {
    idDetalle?: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    pedido: Pedido;
    producto: Producto;
  }

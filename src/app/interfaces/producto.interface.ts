import { DetallePedido } from "./detalle-pedido.interface";
import { ImagenProducto } from "./imagen-productos.interface";
import { Resena } from "./resena.interface";

export interface Producto {
    idProducto?:        number;
    descripcion:       string;
    dimensiones:       null | string;
    estado:            number;
    fechaCreacion:     Date | null;
    idCategoria:       number;
    imgUrl:            null | string;
    marca:             string;
    nombre:            string;
    peso:              number | null;
    precio:            number;
    stock:             number;
    detallePedidos:    DetallePedido[];
    imagenesProductos: ImagenProducto[];
    resenas:           Resena[];
  }
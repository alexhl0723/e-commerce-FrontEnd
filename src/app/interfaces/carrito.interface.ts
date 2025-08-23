export interface Carrito {
    idCarrito?: number;
    idUsuario: number;
    idProducto: number;
    cantidad: number;
    fechaAgregado?: Date;
    // Propiedades relacionadas para mostrar información del producto
    producto?: {
        nombre: string;
        precio: number;
        imgUrl: string | null;
        marca: string;
    };
}

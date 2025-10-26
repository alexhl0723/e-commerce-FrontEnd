export interface Pedido {
    idPedido?: number;
    fechaPedido?: Date;
    fechaEntrega?: Date;
    totalPedido: number;
    metodoPago: String;
    direccionEnvio: string;
    celularContacto: string;
    estado?: String;
    idUsuario: number;
  }
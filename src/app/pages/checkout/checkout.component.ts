import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito/carrito.service';
import { ProductoService } from '../../services/producto/producto.service';
import { forkJoin,map,switchMap } from 'rxjs';
import { Carrito } from '../../interfaces/carrito.interface';
import { Pedido } from '../../interfaces/pedido.interface';
import { PedidoService } from '../../services/pedido/pedido.service';
import { AuthService } from '../../services/auth/auth.service';


@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {

  carrito = signal<Carrito[]>([]);
  idUsuario = 1; // Simulado (se tendria que cambiar por el auth)
  totalPedido = signal<number>(0);
  direccionEnvio: string = '';
  celularContacto: string = '';
  metodoPago: string = 'Tarjeta';
  fechaEntrega: Date = new Date();
  
  constructor(
    private carritoService: CarritoService,
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.cargarCarrito();
    this.calcularFechaEntrega();
  }

  cargarCarrito(){
    this.carritoService.getCarritoPorIdCliente(this.idUsuario).pipe(
      switchMap((carrito) => {

        const peticiones = carrito.map(item => 
          this.productoService.obtenerPorId(item.idProducto).pipe(
            map(producto => ({
              ...item,
              producto
            }))
          )
        );
        return forkJoin(peticiones)
      })
      
    ).subscribe({
      next: (carritoCompleto) => {
        this.carrito.set(carritoCompleto);
        this.totalPedido.set(
          carritoCompleto.reduce((acc,item) => acc + (item.producto?.precio || 0) * item.cantidad,0)
        );
      },
      error: (err) => console.error('Error al obtener carrito:', err)
    });
  }

  calcularFechaEntrega(){
    const hoy = new Date();
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + 3);
    this.fechaEntrega = fecha
  }
  
  finalizarCompra(){
    const pedido: Pedido = {
    idUsuario: this.idUsuario,
    totalPedido: this.totalPedido(),
    metodoPago: this.metodoPago,
    direccionEnvio: this.direccionEnvio,
    celularContacto: this.celularContacto,
    fechaEntrega: this.fechaEntrega
  };

  this.pedidoService.crear(pedido).subscribe({
    next: (nuevoPedido) => {
      this.carritoService.eliminarCarritoUsuario(this.idUsuario).subscribe({
        next: () =>{
          alert('Se registro el pedido correctamente.');
          this.router.navigate(['/tienda'])
        },
        error: (err) => console.error('Error al vaciar carrito:', err)
      });
    },
    error: (err) => {
      console.error('Error al registrar el pedido', err);
      alert('Ocurrió un error al registrar el pedido');
    }
  });
  }

  volverATienda(){
    this.router.navigate(['/tienda'])
  }


}
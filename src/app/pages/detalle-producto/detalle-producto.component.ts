import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../services/producto/producto.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { CarritoService } from '../../services/carrito/carrito.service';
import { NotificationService } from '../../services/notification/notification.service';
import { Producto } from '../../interfaces/producto.interface';
import { Categoria } from '../../interfaces/categoria.interface';
import { Carrito } from '../../interfaces/carrito.interface';
import { NotificationsComponent } from '../../components/shared/notifications/notifications.component';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    NotificationsComponent
  ],
  templateUrl: './detalle-producto.component.html',
  styleUrls: ['./detalle-producto.component.css']
})
export class DetalleProductoComponent implements OnInit {
  producto = signal<Producto | null>(null);
  categoria = signal<Categoria | null>(null);
  carrito = signal<Carrito[]>([]);
  
  // Estado del carrito
  cantidad = signal<number>(1);
  
  // Galería de imágenes
  imagenSeleccionada = signal<number>(0);
  
  // ID del usuario (por ahora hardcodeado, luego se obtiene del auth)
  idUsuario = 1;
  
  private backendHost = 'http://localhost:8084';
  
  // Hacer Math disponible en el template
  Math = Math;

  constructor(  
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private carritoService: CarritoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const idProducto = +params['id'];
      if (idProducto) {
        this.cargarProducto(idProducto);
        this.cargarCarrito();
      }
    });
  }

  cargarProducto(idProducto: number) {
    this.productoService.listarProductos().subscribe(productos => {
      const producto = productos.find(p => p.idProducto === idProducto);
      if (producto) {
        this.producto.set(producto);
        this.cargarCategoria(producto.idCategoria);
      } else {
        this.notificationService.error('Error', 'Producto no encontrado');
        this.router.navigate(['/tienda']);
      }
    });
  }

  cargarCategoria(idCategoria: number) {
    this.categoriaService.listarCategorias().subscribe(categorias => {
      const categoria = categorias.find(cat => cat.idCategoria === idCategoria);
      this.categoria.set(categoria || null);
    });
  }

  cargarCarrito() {
    this.carritoService.getCarritoPorIdCliente(this.idUsuario).subscribe(carrito => {
      this.carrito.set(carrito);
    });
  }

  // Agregar al carrito
  agregarAlCarrito() {
    if (!this.producto()) return;

    const carritoItem: Carrito = {
      idUsuario: this.idUsuario,
      idProducto: this.producto()!.idProducto!,
      cantidad: this.cantidad(),
      producto: {
        nombre: this.producto()!.nombre,
        precio: this.producto()!.precio,
        imgUrl: this.producto()!.imgUrl,
        marca: this.producto()!.marca
      }
    };

    this.carritoService.agregarOActualizar(carritoItem).subscribe({
      next: (carrito) => {
        this.cargarCarrito();
        this.notificationService.success(
          '¡Producto agregado!', 
          `${this.producto()!.nombre} se agregó al carrito`
        );
      },
      error: () => {
        this.notificationService.error(
          'Error', 
          'No se pudo agregar el producto al carrito'
        );
      }
    });
  }

  // Verificar si el producto ya está en el carrito
  get productoEnCarrito(): Carrito | null {
    if (!this.producto()) return null;
    return this.carrito().find(item => item.idProducto === this.producto()!.idProducto!) || null;
  }

  // Actualizar cantidad en el carrito
  actualizarCantidadEnCarrito(nuevaCantidad: number) {
    const itemEnCarrito = this.productoEnCarrito;
    if (!itemEnCarrito) return;

    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito();
      return;
    }

    const carritoActualizado: Carrito = {
      ...itemEnCarrito,
      cantidad: nuevaCantidad
    };

    this.carritoService.agregarOActualizar(carritoActualizado).subscribe({
      next: () => {
        this.cargarCarrito();
      },
      error: () => {
        this.notificationService.error(
          'Error', 
          'No se pudo actualizar la cantidad'
        );
      }
    });
  }

  // Eliminar del carrito
  eliminarDelCarrito() {
    const itemEnCarrito = this.productoEnCarrito;
    if (!itemEnCarrito) return;

    this.carritoService.eliminarCarrito(itemEnCarrito.idCarrito!).subscribe({
      next: () => {
        this.cargarCarrito();
        this.notificationService.success(
          '¡Producto eliminado!', 
          'Se eliminó del carrito'
        );
      },
      error: () => {
        this.notificationService.error(
          'Error', 
          'No se pudo eliminar del carrito'
        );
      }
    });
  }

  // Navegar a la tienda
  irATienda() {
    this.router.navigate(['/tienda']);
  }

  // Navegar al carrito
  irAlCarrito() {
    this.router.navigate(['/tienda']);
    // Aquí podrías abrir el carrito lateral si implementas un servicio compartido
  }

  // Seleccionar imagen de la galería
  seleccionarImagen(index: number) {
    this.imagenSeleccionada.set(index);
  }

  // Obtener imagen principal
  get imagenPrincipal(): string | null {
    if (!this.producto()) return null;
    
    if (this.producto()!.imagenesProductos && this.producto()!.imagenesProductos.length > 0) {
      const imagen = this.producto()!.imagenesProductos[this.imagenSeleccionada()];
      return this.resolveImg(imagen.urlImagen);
    }
    
    return this.resolveImg(this.producto()!.imgUrl);
  }

  // Resolver URLs de imagen
  resolveImg(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${this.backendHost}${url}`;
  }

  // Formatear precio
  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  // Verificar stock
  get tieneStock(): boolean {
    return this.producto() ? this.producto()!.stock > 0 : false;
  }

  // Obtener estado del stock
  get estadoStock(): string {
    if (!this.producto()) return '';
    
    if (this.producto()!.stock > 10) return 'Disponible';
    if (this.producto()!.stock > 5) return 'Stock limitado';
    if (this.producto()!.stock > 0) return 'Últimas unidades';
    return 'Sin stock';
  }

  // Obtener color del estado del stock
  get colorEstadoStock(): string {
    if (!this.producto()) return 'text-gray-500';
    
    if (this.producto()!.stock > 10) return 'text-green-600';
    if (this.producto()!.stock > 5) return 'text-yellow-600';
    if (this.producto()!.stock > 0) return 'text-orange-600';
    return 'text-red-600';
  }
}
